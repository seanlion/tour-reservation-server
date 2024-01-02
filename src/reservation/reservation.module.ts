import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationController } from './reservation.controller';
import { ReservationRepository } from './reservation.repository';
import { ReservationService } from './reservation.service';
import { TourModule } from 'src/tour/tour.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), TourModule],
  controllers: [ReservationController],
  providers: [ReservationRepository, ReservationService],
  exports: [ReservationService, TypeOrmModule],
})
export class ReservationModule {}
