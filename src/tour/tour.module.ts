import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { TourController } from './tour.controller';
import { TourRepository } from './tour.repository';
import { TourService } from './tour.service';
import { SellerModule } from 'src/seller/seller.module';
import { DayoffModule } from 'src/dayoff/dayoff.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tour]), SellerModule, DayoffModule],
  controllers: [TourController],
  providers: [TourRepository, TourService],
  exports: [TourService, TypeOrmModule],
})
export class TourModule {}
