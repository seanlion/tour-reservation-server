import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dayoff } from './entities/dayoff.entity';
import { DayoffRepository } from './dayoff.repository';
import { DayoffService } from './dayoff.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dayoff])],
  controllers: [],
  providers: [DayoffRepository, DayoffService],
  exports: [DayoffService, TypeOrmModule],
})
export class DayoffModule {}
