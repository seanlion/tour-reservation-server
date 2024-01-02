import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TourRepository } from './tour.repository';
import { SellerService } from '../seller/seller.service';
import {
  TourAvailableScheduleDto,
  TourCreateDto,
  TourDto,
} from './dto/tour.dto';
import { TourNotFoundException } from '../exception/TourNotFoundException';
import { DayoffCreateDto } from '../dayoff/dto/dayoff.dto';
import { DayoffService } from '../dayoff/dayoff.service';
import { getAllDatesInGivenMonth } from './utils/util';
import { Tour } from './entities/tour.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { Dayoff } from 'src/dayoff/entities/dayoff.entity';

@Injectable()
export class TourService {
  constructor(
    private readonly tourRepository: TourRepository,
    private readonly sellerService: SellerService,
    private readonly dayOffService: DayoffService,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  private readonly logger = new Logger(TourService.name);

  async addTourBySeller(addTourDto: TourCreateDto): Promise<boolean> {
    try {
      // seller Id 찾기
      const seller = await this.sellerService.fetchSeller({
        name: addTourDto.sellerName,
      });

      await this.tourRepository.createTour(addTourDto, seller);
      return true;
    } catch (error) {
      this.logger.error(
        `TourService:addTourBySeller: ${JSON.stringify(error.message)}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async updateTourBySeller(
    tourId: number,
    updateTourDto: TourDto,
  ): Promise<TourDto> {
    try {
      const tour = await this.tourRepository.saveTour(updateTourDto);
      if (!tour) {
        throw new TourNotFoundException();
      }
      return TourDto.from(tour);
    } catch (error) {
      this.logger.error(
        `TourService:updateTourBySeller: ${JSON.stringify(error.message)}`,
      );
      if (error instanceof TourNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async addTourDayoff(addDayoffDto: DayoffCreateDto): Promise<boolean> {
    try {
      // tour id로 엔티티 조회해서, 엔티티 없으면 dayoff 못 만듬. sellerName 안 맞으면 exception
      // dayoff 엔티티 만든 다음에 tour쪽에 추가
      const tour = await this.tourRepository.findOneByCondition({
        relations: {
          seller: true,
        },
        where: {
          id: addDayoffDto.tourId,
        },
      });
      if (!tour) {
        throw new TourNotFoundException();
      }
      if (tour.seller.name !== addDayoffDto.sellerName) {
        throw new UnauthorizedException();
      }
      // TODO : dayoff가 추가되면 availableSchedule 캐싱 데이터 갱신해야함.
      await this.dayOffService.createDayOff(addDayoffDto, tour);
      await this.updateAvailableScheduleCache(
        addDayoffDto.sellerName,
        tour.id,
        addDayoffDto.year,
        addDayoffDto.month,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `TourService:addTourDayoff(
                : ${JSON.stringify(error.message)}`,
      );
      if (error instanceof TourNotFoundException) {
        throw error;
      } else if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  private async updateAvailableScheduleCache(
    sellerName: string,
    tourId: number,
    year: number,
    month: number,
  ) {
    const tour = await this.tourRepository.findOneByCondition({
      relations: {
        seller: true,
        dayoffs: true,
        reservations: true,
      },
      where: {
        seller: {
          name: sellerName,
        },
        id: tourId,
        // TODO: 여기서 바로 dayoff를 필터링 가능?
      },
    });
    const tourAvailableSchedule = this.calculateAvailableSchedule(
      year,
      month,
      tour.dayoffs,
    );
    const cacheKey = `SCHEDULE:${tourId}:${year}:${month}`;
    const value = {
      tourId: tourId,
      tourTitle: tour.title,
      year: year,
      month: month,
      availableSchedule: tourAvailableSchedule,
    } as TourAvailableScheduleDto;
    await this.redis.set(
      cacheKey,
      JSON.stringify(value),
      'EX',
      60 * 60 * 24 * 3,
    );
  }

  async findTourWithReservationsAndDayoffs(tourId: number): Promise<Tour> {
    try {
      const tour = await this.tourRepository.findOneByCondition({
        relations: {
          reservations: true,
          dayoffs: true,
        },
        where: {
          id: tourId,
        },
      });
      return tour;
    } catch (error) {
      this.logger.error(
        `TourService:fetchToursBySeller(
                    : ${JSON.stringify(error.message)}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async fetchToursBySeller(sellerName: string): Promise<TourDto[]> {
    try {
      const tours = await this.tourRepository.findByCondition({
        relations: {
          seller: true,
        },
        where: {
          seller: {
            name: sellerName,
          },
        },
      });
      return tours.map((tour) => TourDto.from(tour));
    } catch (error) {
      this.logger.error(
        `TourService:fetchToursBySeller : ${JSON.stringify(error.message)}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async fetchTourBySeller(
    sellerName: string,
    tourId: number,
  ): Promise<TourDto> {
    try {
      const tour = await this.tourRepository.findOneByCondition({
        relations: {
          seller: true,
          dayoffs: true,
        },
        where: {
          seller: {
            name: sellerName,
          },
          id: tourId,
        },
      });
      return TourDto.from(tour);
    } catch (error) {
      this.logger.error(
        `TourService:fetchTourBySeller(
                        : ${JSON.stringify(error.message)}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async fetchAvailableScheduleByTour(
    sellerName: string,
    tourId: number,
    year: number,
    month: number,
  ): Promise<TourAvailableScheduleDto> {
    try {
      // cache hit 확인
      const cacheKey = `SCHEDULE:${tourId}:${year}:${month}`;
      const cachedValue = await this.redis.get(cacheKey);
      if (cachedValue) {
        return JSON.parse(cachedValue) as TourAvailableScheduleDto;
      }

      const tour = await this.tourRepository.findOneByCondition({
        relations: {
          seller: true,
          dayoffs: true,
          reservations: true,
        },
        where: {
          seller: {
            name: sellerName,
          },
          id: tourId,
          // TODO: 여기서 바로 dayoff를 필터링 가능?
        },
      });
      const tourAvailableSchedule = this.calculateAvailableSchedule(
        year,
        month,
        tour.dayoffs,
      );
      return TourAvailableScheduleDto.from(
        tour,
        year,
        month,
        tourAvailableSchedule,
      );
    } catch (error) {
      this.logger.error(
        `TourService:fetchAvailableScheduleByTour(
                        : ${JSON.stringify(error.message)}`,
      );
      throw new InternalServerErrorException();
    }
  }

  private calculateAvailableSchedule(
    year: number,
    month: number,
    dayoffs: Dayoff[],
  ): number[] {
    const dates = getAllDatesInGivenMonth(year, month);
    const dayoffsOfMonth = dayoffs.filter((off) => off.month === month);
    const tourAvailableSchedule = dates.reduce((availDates: number[], date) => {
      return dayoffsOfMonth.some((off) => off.checkDayoff(date))
        ? availDates
        : [...availDates, date.getDate()];
    }, []);
    return tourAvailableSchedule;
  }
}
