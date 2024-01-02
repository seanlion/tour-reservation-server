import { IsEnum, IsString } from 'class-validator';
import { ReservationStatus } from '../types/status_enum';
import { Reservation } from '../entities/reservation.entity';
import { pick } from 'lodash';
import { ApiProperty } from '@nestjs/swagger';

export class ReservationRegisterDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  reservation_date: string; // 2023-02-02 형태
}

export class ReservationUpdateDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  original_reservation_date: string; // 2023-02-02 형태

  @ApiProperty()
  @IsString()
  update_reservation_date: string; // 2023-02-02 형태
}

export class ReservationApproveDto {
  @ApiProperty()
  @IsString()
  sellerName: string;
}

export class ReservationCancelDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  reservation_date: string; // 2023-02-02 형태
}

export class ReservationCheckDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  sellerName: string;

  @ApiProperty()
  status?: ReservationStatus;

  @ApiProperty()
  reservationDate?: string;

  @ApiProperty()
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

  static emtpyValue(): ReservationCheckDto {
    const reservationDto = new ReservationCheckDto();
    return reservationDto;
  }
}

export class ReservationStatusDto {
  @IsString()
  token?: string;

  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  static from(status: ReservationStatus, token?: string): ReservationStatusDto {
    const statusDto = new ReservationStatusDto();
    if (token) {
      statusDto.token = token;
    }
    statusDto.status = status;
    return statusDto;
  }
}
