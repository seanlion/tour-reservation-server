import { HttpException, HttpStatus } from '@nestjs/common';

export class ReservationNotFoundException extends HttpException {
  constructor() {
    super('예약이 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
  }
}
