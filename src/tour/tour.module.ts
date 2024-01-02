import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { TourController } from './tour.controller';
import { TourRepository } from './tour.repository';
import { TourService } from './tour.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tour])],
  controllers: [TourController],
  providers: [TourRepository, TourService],
  exports: [TourService, TypeOrmModule],
})
export class TourModule {}
