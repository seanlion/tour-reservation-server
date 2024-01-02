import { IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { pick } from 'lodash';
import { DayoffDto } from '../../dayoff/dto/dayoff.dto';
import { Type } from 'class-transformer';
import { Tour } from '../entities/tour.entity';

export class TourCreateDto {
  @IsString()
  title: string;

  @IsString()
  sellerName: string;
}

export class TourDto {
  @IsNumber()
  id: number;

  @IsString()
  sellerName: string;

  @IsString()
  title: string;

  // TODO: 고객 예약 리스트가 있어야 함.

  // available schedule이 있어야 함.
  @IsNumber({}, { each: true })
  availableSchedulesByMonth?: number[];

  // 휴일 정보가 있어야 함.
  @IsObject()
  @ValidateNested()
  @Type(() => DayoffDto)
  dayoffs?: DayoffDto[];

  static from(tour: Tour, availableSchedule?: number[]): TourDto {
    const tourDto = new TourDto();
    Object.assign(tourDto, pick(tour, ['id', 'title']));
    tourDto.sellerName = tour.seller.name;
    tourDto.dayoffs = tour.dayoffs.map((off) => DayoffDto.from(off));
    // TODO: reservation도 추가.
    if (availableSchedule) {
      tourDto.availableSchedulesByMonth = availableSchedule;
    }
    return tourDto;
  }
}

export class TourAvailableScheduleDto {
  tourId: number;
  tourTitle: string;
  year: number;
  month: number;
  availableSchedule: number[];

  static from(
    tour: Tour,
    year: number,
    month: number,
    availableSchedule: number[],
  ): TourAvailableScheduleDto {
    const availableScheduleDto = new TourAvailableScheduleDto();
    availableScheduleDto.tourId = tour.id;
    availableScheduleDto.tourTitle = tour.title;
    availableScheduleDto.year = year;
    availableScheduleDto.month = month;
    availableScheduleDto.availableSchedule = availableSchedule;

    return availableScheduleDto;
  }
}
