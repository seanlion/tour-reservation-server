import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyApprovedException extends HttpException {
  constructor() {
    super('이미 승인 된 예약입니다.', HttpStatus.BAD_REQUEST);
  }
}
