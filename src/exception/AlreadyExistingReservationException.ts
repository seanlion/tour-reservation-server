import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyExistingReservationException extends HttpException {
  constructor() {
    super('이미 확정된 예약이 존재합니다.', HttpStatus.BAD_REQUEST);
  }
}
