import { HttpException, HttpStatus } from '@nestjs/common';

export class CannotCanceledException extends HttpException {
  constructor() {
    super('취소가 불가합니다.', HttpStatus.BAD_REQUEST);
  }
}
