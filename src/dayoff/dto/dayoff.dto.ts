import { pick } from 'lodash';
import { DayoffType } from '../types/dayoff_type';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Dayoff } from '../entities/dayoff.entity';
import { ApiProperty } from '@nestjs/swagger';

export class DayoffCreateDto {
  @ApiProperty()
  @IsString()
  sellerName: string;

  @ApiProperty()
  @IsNumber()
  tourId: number;

  @ApiProperty()
  @IsEnum(DayoffType)
  type: DayoffType;

  @ApiProperty()
  @IsNumber()
  month: number;

  @ApiProperty()
  @IsNumber()
  date?: number;

  @ApiProperty()
  @IsNumber()
  day?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  year?: number;
}

export class DayoffDto {
  @ApiProperty()
  @IsEnum(DayoffType)
  type: DayoffType;

  @ApiProperty()
  @IsNumber()
  month: number;

  @ApiProperty()
  @IsNumber()
  date: number;

  @ApiProperty()
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
