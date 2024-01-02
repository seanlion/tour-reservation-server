import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  TourAvailableScheduleDto,
  TourCreateDto,
  TourDto,
} from './dto/tour.dto';
import { DayoffCreateDto } from 'src/dayoff/dto/dayoff.dto';
import { TourService } from './tour.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Tour')
@Controller('/tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @ApiOperation({ description: 'Seller lists a tour product' })
  @Post('/seller/addTour')
  async addTourBySeller(@Body() addTourDto: TourCreateDto): Promise<boolean> {
    return await this.tourService.addTourBySeller(addTourDto);
  }

  @ApiOperation({ description: 'Seller updates the tour product' })
  @Post('/seller/updateTour/:tourId')
  async updateTourBySeller(
    @Param('tourId') tourId: number,
    @Body() updateTourDto: TourDto,
  ): Promise<TourDto> {
    return await this.tourService.updateTourBySeller(tourId, updateTourDto);
  }

  @ApiOperation({ description: 'View all tours from specific seller' })
  @Get('/seller/:sellerName/tours')
  async fetchToursBySeller(
    @Param('sellerName') sellerName: string,
  ): Promise<TourDto[]> {
    return await this.tourService.fetchToursBySeller(sellerName);
  }

  @ApiOperation({ description: 'View single tour from specific seller' })
  @Get('/seller/:sellerName/tour/:tourId')
  async fetchTourBySeller(
    @Param('sellerName') sellerName: string,
    @Param('tourId') tourId: number,
  ): Promise<TourDto> {
    return await this.tourService.fetchTourBySeller(sellerName, tourId);
  }

  @ApiOperation({ description: 'View the available dates for that tour' })
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

  @ApiOperation({ description: 'Add dayoff information to this tour' })
  @Post('/seller/:tourId/addDayoff')
  async addTourDayoff(@Body() addDayoffDto: DayoffCreateDto): Promise<boolean> {
    return await this.tourService.addTourDayoff(addDayoffDto);
  }
}
