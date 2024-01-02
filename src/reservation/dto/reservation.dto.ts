import { IsString } from 'class-validator';
import { ReservationStatus } from '../types/status_enum';
import { Reservation } from '../entities/reservation.entity';
import { pick } from 'lodash';

export class ReservationRegisterDto {
  @IsString()
  username: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  reservation_date: string; // 2023-02-02 형태
}

export class ReservationUpdateDto {
  @IsString()
  username: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  original_reservation_date: string; // 2023-02-02 형태

  @IsString()
  update_reservation_date: string; // 2023-02-02 형태
}

export class ReservationApproveDto {
  @IsString()
  sellerName: string;
}

export class ReservationCancelDto {
  @IsString()
  username: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  reservation_date: string; // 2023-02-02 형태
}

export class ReservationCheckDto {
  @IsString()
  token: string;

  @IsString()
  sellerName: string;

  status?: ReservationStatus;

  reservationDate?: string;

  tourTitle?: string;

  static from(
    reservation: Reservation,
    sellerName: string,
  ): ReservationCheckDto {
    const reservationDto = new ReservationCheckDto();
    const partialData = pick(reservation, [
      'uuid',
      'tour',
      'reservationDate',
      'status',
    ]);
    Object.assign(reservationDto, {
      token: partialData.uuid,
      sellerName: sellerName,
      status: partialData.status,
      reservationDate: partialData.reservationDate,
      tourTitle: partialData.tour.title,
    });
    return reservationDto;
  }
}