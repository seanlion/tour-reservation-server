import { createTourFixture } from '../../tour/tests/tour.fixture';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../types/status_enum';
import {
  ReservationApproveDto,
  ReservationCancelDto,
  ReservationCheckDto,
  ReservationRegisterDto,
  ReservationUpdateDto,
} from '../dto/reservation.dto';
import { Tour } from '../../tour/entities/tour.entity';

export function createReservationFixture(
  status: ReservationStatus = ReservationStatus.APPROVED,
  tour?: Tour,
): Reservation {
  const reservation = new Reservation();
  reservation.id = 1;
  reservation.uuid = '123e4567-e89b-12d3-a456-426655440000'; // Example UUID
  reservation.status = status;
  reservation.reservationDate = '2023-03-02';
  reservation.year = 2023;
  reservation.month = 3;
  reservation.date = 2;
  reservation.createdAt = new Date();
  reservation.updatedAt = new Date();
  reservation.username = 'John Doe';
  reservation.phoneNumber = '01012345678';
  if (tour) {
    reservation.tour = tour;
  } else {
    reservation.tour = createTourFixture();
  }
  return reservation;
}

export function createReservationRegisterDtoFixture(): ReservationRegisterDto {
  const registerDto = new ReservationRegisterDto();
  registerDto.username = 'John Doe';
  registerDto.phoneNumber = '01012345678';
  registerDto.reservation_date = '2023-03-02';
  return registerDto;
}

export function createReservationUpdateDtoFixture(): ReservationUpdateDto {
  const updateDto = new ReservationUpdateDto();
  updateDto.username = 'John Doe';
  updateDto.phoneNumber = '01012345678';
  updateDto.original_reservation_date = '2023-03-02';
  updateDto.update_reservation_date = '2023-03-05';
  return updateDto;
}

export function createReservationApproveDtoFixture(): ReservationApproveDto {
  const approveDto = new ReservationApproveDto();
  approveDto.sellerName = 'Test Seller';
  return approveDto;
}

export function createReservationCancelDtoFixture(): ReservationCancelDto {
  const cancelDto = new ReservationCancelDto();
  cancelDto.username = 'John Doe';
  cancelDto.phoneNumber = '01012345678';
  cancelDto.reservation_date = '2023-03-02';
  return cancelDto;
}

export function createReservationCheckDtoFixture(): ReservationCheckDto {
  const checkDto = new ReservationCheckDto();
  checkDto.token = '123e4567-e89b-12d3-a456-426655440000';
  checkDto.sellerName = 'Test Seller';
  return checkDto;
}
