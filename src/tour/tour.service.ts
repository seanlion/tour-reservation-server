import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TourRepository } from './tour.repository';
import { SellerService } from 'src/seller/seller.service';
import {
  TourAvailableScheduleDto,
  TourCreateDto,
  TourDto,
} from './dto/tour.dto';
import { TourNotFoundException } from 'src/exception/TourNotFoundException';
import { DayoffCreateDto } from 'src/dayoff/dto/dayoff.dto';
import { DayoffService } from 'src/dayoff/dayoff.service';
import { getAllDatesInGivenMonth } from './utils/util';

@Injectable()
export class TourService {
  constructor(
    private readonly tourRepository: TourRepository,
    private readonly sellerService: SellerService,
    private readonly dayOffService: DayoffService,
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
      const tour = await this.tourRepository.findById(addDayoffDto.tourId);
      if (!tour) {
        throw new TourNotFoundException();
      }
      if (tour.seller.name !== addDayoffDto.sellerName) {
        throw new UnauthorizedException();
      }
      // TODO : dayoff가 추가되면 availableSchedule 캐싱 데이터 갱신해야함.
      await this.dayOffService.createDayOff(addDayoffDto, tour);
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
        `TourService:fetchToursBySeller(
                    : ${JSON.stringify(error.message)}`,
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
    /* 예약 가능 조건
        1.휴일이 아니어야함.
        2.해당 일에 예약이 5개 미만이어야 함.
    */
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
    // 선택한 연도와 월을 가지고, 그 월의 (그 tour의) dayoff를 가지고 와야 함.
    /*
        예를 들어 2023년 3월이 인자이면,
        2023.03의 모든 날짜를 구한다.(30개인지, 31개인지)
        month가 3인 dayoff 데이터들을 가지고 오고, 
        만약 데이터가 3개 있다.
        1. dayOfWeek : 0(Sun), 6(Sat)
        2. date: 16일

        이러면 2023.03의 TourAvailableSchedule은 
        일요일과, 토요일을 제외하고, 16일을 제외한 3월의 모든 일자를 리턴해야 함.
     */
    const dates = getAllDatesInGivenMonth(year, month);
    const dayoffsOfMonth = tour.dayoffs.filter((off) => off.month === month);
    const tourAvailableSchedule = dates.reduce((availDates: number[], date) => {
      return dayoffsOfMonth.every((off) => off.checkDayoff(date))
        ? availDates
        : [...availDates, date.getDate()];
    }, []);
    return TourAvailableScheduleDto.from(
      tour,
      year,
      month,
      tourAvailableSchedule,
    );
    // TODO : 3월의 예약 5개 이상인 날을 보고, 그 날들을 제외해야 함.
  }
}
