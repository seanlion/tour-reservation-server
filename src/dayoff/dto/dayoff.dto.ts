import { pick } from 'lodash';
import { DayoffType } from '../types/dayoff_type';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Dayoff } from '../entities/dayoff.entity';

export class DayoffCreateDto {
  @IsString()
  sellerName: string;

  @IsNumber()
  tourId: number;

  @IsEnum(DayoffType)
  type: DayoffType;

  @IsNumber()
  month: number;

  @IsNumber()
  date?: number;

  @IsNumber()
  day?: number;

  @IsOptional()
  @IsNumber()
  year?: number;
}

export class DayoffDto {
  @IsEnum(DayoffType)
  type: DayoffType;

  @IsNumber()
  month: number;

  @IsNumber()
  date: number;

  @IsNumber()
  day: number;

  static from(dayoff: Dayoff): DayoffDto {
    const dayoffDto = new DayoffDto();
    switch (dayoff.type) {
      case DayoffType.DATE:
        Object.assign(dayoffDto, pick(dayoff, ['type', 'date']));
        dayoffDto.month = dayoff.dayOfMonth;
        break;
      case DayoffType.WEEKLY:
        Object.assign(dayoffDto, pick(dayoff, ['type']));
        dayoffDto.day = dayoff.dayOfWeek;
        break;
    }
    return dayoffDto;
  }
}
