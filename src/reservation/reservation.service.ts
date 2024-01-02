import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ReservationApproveDto,
  ReservationCancelDto,
  ReservationCheckDto,
  ReservationRegisterDto,
  ReservationStatusDto,
  ReservationUpdateDto,
} from './dto/reservation.dto';
import { ReservationRepository } from './reservation.repository';
import { TourService } from '../tour/tour.service';
import { ReservationStatus } from './types/status_enum';
import { Tour } from '../tour/entities/tour.entity';
import {
  calculateDateDiff,
  getCurrentOnlyDateFormat,
  parseDateFromDateString,
} from './utils/date';
import { NotAvailableScheduleException } from '../exception/notAvailableScheduleException';
import { AUTO_APPROVED_COUNT } from './constant';
import { v4 as uuidv4 } from 'uuid';
import { ReservationPayload } from './types/payload';
import { ReservationNotFoundException } from '../exception/ReservationNotFoundException';
import { AlreadyApprovedException } from '../exception/AlreadyApprovedException';
import { Reservation } from './entities/reservation.entity';
import { AlreadyCanceledException } from '../exception/AlreadyCanceledException';
import { CannotCanceledException } from '../exception/CannotCanceledException';
import { AlreadyExistingReservationException } from 'src/exception/AlreadyExistingReservationException';

@Injectable()
export class ReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly tourService: TourService,
  ) {}
  private readonly logger = new Logger(ReservationService.name);

  async registerReservation(
    tourId: number,
    registerDto: ReservationRegisterDto,
  ): Promise<ReservationStatusDto> {
    try {
      // find부터 insert 까지 트랜잭션 필요할 수 있음.
      const tour =
        await this.tourService.findTourWithReservationsAndDayoffs(tourId);

      if (tour.reservations) {
        const alreadyExistingReserv = tour.reservations.filter(
          (reservation) =>
            this.validateUserInfo(reservation, {
              username: registerDto.username,
              phoneNumber: registerDto.phoneNumber,
              reservationDate: registerDto.reservation_date,
            }) && reservation.status === ReservationStatus.APPROVED,
        );
        if (alreadyExistingReserv) {
          throw new AlreadyExistingReservationException();
        }
      }
      const checkedData = this.checkGivenDateAvailableForReservation(
        registerDto.reservation_date,
        tour,
      );
      // approved인 경우 uuid 만들어서 Reservation 엔티티 삽입
      const payload = {
        username: registerDto.username,
        phoneNumber: registerDto.phoneNumber,
        reservationDate: registerDto.reservation_date,
        status: checkedData.status,
        year: checkedData.date.getFullYear(),
        month: checkedData.date.getMonth() + 1,
        date: checkedData.date.getDate(),
        tour: tour,
      } as ReservationPayload;
      if (checkedData.status === ReservationStatus.APPROVED) {
        const uuid = uuidv4();
        payload.uuid = uuid;
      }
      // PENDING이면 uuid 없이 Reservation 엔티티 삽입
      await this.reservationRepository.createReservation(payload);
      return ReservationStatusDto.from(checkedData.status, payload.uuid);
    } catch (error) {
      this.logger.error(
        `ReservationService:registerReservation: ${JSON.stringify(
          error.message,
        )}`,
      );
      if (
        error instanceof NotAvailableScheduleException ||
        error instanceof AlreadyExistingReservationException
      ) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  private checkGivenDateAvailableForReservation(
    reservation_date: string,
    tour: Tour,
  ): { date: Date; status: ReservationStatus } {
    const input_date = parseDateFromDateString(reservation_date);
    // tour.reservation 중에 해당 날짜에 해당하는 approved reservation이 있는지 체크
    // dayoff가 input date에 걸리는지 체크
    const includedInputInDayoffs = tour.dayoffs.some((off) =>
      off.checkDayoff(input_date),
    );
    if (includedInputInDayoffs) {
      throw new NotAvailableScheduleException();
    }
    // 해당 날의 reservation이 5개 이상인지 확인
    const approvedReservations = tour.reservations.filter(
      (reserv) =>
        reserv.reservationDate === reservation_date &&
        reserv.status === ReservationStatus.APPROVED,
    );
    if (approvedReservations.length >= AUTO_APPROVED_COUNT) {
      return {
        date: input_date,
        status: ReservationStatus.PENDING,
      };
    }
    return {
      date: input_date,
      status: ReservationStatus.APPROVED,
    };
  }

  async approveReservation(
    reservationId: number,
    approveDto: ReservationApproveDto,
  ): Promise<ReservationStatusDto> {
    try {
      // reservation 엔티티 업데이트해서 상태 변경
      const reservation = await this.reservationRepository.findOneByCondition({
        relations: {
          tour: {
            seller: true,
          },
        },
        where: {
          id: reservationId,
        },
      });
      if (!reservation) {
        throw new ReservationNotFoundException();
      }
      if (reservation.status === ReservationStatus.APPROVED) {
        throw new AlreadyApprovedException();
      }
      if (reservation.tour.seller.name !== approveDto.sellerName) {
        throw new UnauthorizedException();
      }
      const updatePayload = {
        status: ReservationStatus.APPROVED,
        uuid: uuidv4(),
      };
      await this.reservationRepository.updateReservation(
        reservation,
        updatePayload,
        ['status', 'uuid'],
      );
      return ReservationStatusDto.from(
        updatePayload.status,
        updatePayload.uuid,
      );
    } catch (error) {
      this.logger.error(
        `ReservationService:approveReservation: ${JSON.stringify(
          error.message,
        )}`,
      );
      if (
        error instanceof ReservationNotFoundException ||
        error instanceof AlreadyApprovedException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async cancelReservation(
    reservationId: number,
    cancelDto: ReservationCancelDto,
  ): Promise<boolean> {
    try {
      const reservation = await this.reservationRepository.findOneByCondition({
        where: {
          id: reservationId,
        },
      });
      if (!reservation) {
        throw new ReservationNotFoundException();
      }
      if (reservation.status === ReservationStatus.CANCELED) {
        throw new AlreadyCanceledException();
      }
      if (
        !this.validateUserInfo(reservation, {
          reservationDate: cancelDto.reservation_date,
          username: cancelDto.username,
          phoneNumber: cancelDto.phoneNumber,
        })
      ) {
        throw new UnauthorizedException();
      }
      // 예약일 3일 전까지 취소 가능(diff가 3 이상이어야 취소 가능)
      const dateDiff = calculateDateDiff(
        getCurrentOnlyDateFormat(),
        parseDateFromDateString(reservation.reservationDate),
      );
      if (dateDiff < 3) {
        throw new CannotCanceledException();
      }

      const updatePayload = {
        status: ReservationStatus.CANCELED,
      };
      await this.reservationRepository.updateReservation(
        reservation,
        updatePayload,
        ['status'],
      );
      return true;
    } catch (error) {
      this.logger.error(
        `ReservationService:cancelReservation: ${JSON.stringify(
          error.message,
        )}`,
      );
      if (
        error instanceof ReservationNotFoundException ||
        error instanceof AlreadyCanceledException ||
        error instanceof UnauthorizedException ||
        error instanceof CannotCanceledException
      ) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  private validateUserInfo(
    reservation: Reservation,
    userInfo: {
      reservationDate: string;
      username: string;
      phoneNumber: string;
    },
  ): boolean {
    return (
      reservation.reservationDate === userInfo.reservationDate &&
      reservation.username === userInfo.username &&
      reservation.phoneNumber === userInfo.phoneNumber
    );
  }

  async fetchReservationByToken(
    checkDto: ReservationCheckDto,
  ): Promise<ReservationCheckDto> {
    try {
      const reservation = await this.reservationRepository.findOneByCondition({
        relations: {
          tour: {
            seller: true,
          },
        },
        where: {
          uuid: checkDto.token,
        },
      });
      if (!reservation) {
        return ReservationCheckDto.emtpyValue();
      }
      if (reservation.tour.seller.name !== checkDto.sellerName) {
        throw new UnauthorizedException();
      }
      return ReservationCheckDto.from(reservation, checkDto.sellerName);
    } catch (error) {
      this.logger.error(
        `ReservationService:fetchReservationByToken: ${JSON.stringify(
          error.message,
        )}`,
      );
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async updateReservation(
    tourId: number,
    updateDto: ReservationUpdateDto,
  ): Promise<boolean> {
    try {
      const reservation = await this.reservationRepository.findOneByCondition({
        relations: {
          tour: {
            seller: true,
          },
        },
        where: {
          username: updateDto.username,
          phoneNumber: updateDto.phoneNumber,
          reservationDate: updateDto.original_reservation_date,
        },
      });
      if (!reservation) {
        throw new ReservationNotFoundException();
      }
      if (
        !this.validateUserInfo(reservation, {
          reservationDate: updateDto.original_reservation_date,
          username: updateDto.username,
          phoneNumber: updateDto.phoneNumber,
        })
      ) {
        throw new UnauthorizedException();
      }
      if (reservation.status === ReservationStatus.APPROVED) {
        throw new AlreadyApprovedException();
      }
      if (reservation.status === ReservationStatus.PENDING) {
        const tour =
          await this.tourService.findTourWithReservationsAndDayoffs(tourId);

        const checkedData = this.checkGivenDateAvailableForReservation(
          updateDto.update_reservation_date,
          tour,
        );
        if (checkedData.status === ReservationStatus.APPROVED) {
          const updatePayload = {
            reservationDate: updateDto.update_reservation_date,
            status: checkedData.status,
            year: checkedData.date.getFullYear(),
            month: checkedData.date.getMonth() + 1,
            date: checkedData.date.getDate(),
            uuid: uuidv4(),
          } as ReservationPayload;
          await this.reservationRepository.updateReservation(
            reservation,
            updatePayload,
            ['status', 'uuid', 'reservationDate', 'year', 'month', 'date'],
          );
          return true;
        }
        return false;
      }
    } catch (error) {
      this.logger.error(
        `ReservationService:updateReservation: ${JSON.stringify(
          error.message,
        )}`,
      );
      if (
        error instanceof ReservationNotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof AlreadyApprovedException ||
        error instanceof NotAvailableScheduleException
      ) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
