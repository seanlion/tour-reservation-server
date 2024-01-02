import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyCanceledException extends HttpException {
  constructor() {
    super('이미 취소 된 예약입니다.', HttpStatus.BAD_REQUEST);
  }
}
