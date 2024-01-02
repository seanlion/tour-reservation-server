import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  TourAvailableScheduleDto,
  TourCreateDto,
  TourDto,
} from './dto/tour.dto';
import { DayoffCreateDto } from 'src/dayoff/dto/dayoff.dto';
import { TourService } from './tour.service';

@Controller('/tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post('/seller/addTour')
  async addTourBySeller(@Body() addTourDto: TourCreateDto): Promise<boolean> {
    return await this.tourService.addTourBySeller(addTourDto);
  }

  @Post('/seller/updateTour/:tourId')
  async updateTourBySeller(
    @Param('tourId') tourId: number,
    @Body() updateTourDto: TourDto,
  ): Promise<TourDto> {
    return await this.tourService.updateTourBySeller(tourId, updateTourDto);
  }

  @Get('/seller/:sellerName/tours')
  async fetchToursBySeller(
    @Param('sellerName') sellerName: string,
  ): Promise<TourDto[]> {
    return await this.tourService.fetchToursBySeller(sellerName);
  }

  @Get('/seller/:sellerName/tour/:tourId')
  async fetchTourBySeller(
    @Param('sellerName') sellerName: string,
    @Param('tourId') tourId: number,
  ): Promise<TourDto> {
    return await this.tourService.fetchTourBySeller(sellerName, tourId);
  }

  @Get('/seller/:sellerName/:tourId/available_schedule')
  async fetchAvailableScheduleByTour(
    @Param('sellerName') sellerName: string,
    @Param('tourId') tourId: number,
    @Query('year') year: number,
    @Query('month') month: number,
  ): Promise<TourAvailableScheduleDto> {
    return await this.tourService.fetchAvailableScheduleByTour(
      sellerName,
      tourId,
      year,
      month,
    );
  }

  @Post('/seller/:tourId/addDayoff')
  async addTourDayoff(@Body() addDayoffDto: DayoffCreateDto): Promise<boolean> {
    await this.tourService.addTourDayoff(addDayoffDto);
    return;
  }
}
