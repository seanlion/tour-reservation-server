import { HttpException, HttpStatus } from '@nestjs/common';

export class SellerNotFoundException extends HttpException {
  constructor() {
    super('판매자가 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
  }
}
