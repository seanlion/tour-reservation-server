import { HttpException, HttpStatus } from '@nestjs/common';

export class TourNotFoundException extends HttpException {
  constructor() {
    super('여행 상품이 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
  }
}
