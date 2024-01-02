import { HttpException } from '@nestjs/common';

export class NotAvailableScheduleException extends HttpException {
  constructor() {
    super('예약이 불가합니다.', 501);
  }
}
