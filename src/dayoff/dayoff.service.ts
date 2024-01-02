import { Injectable, Logger } from '@nestjs/common';
import { DayoffRepository } from './dayoff.repository';
import { DayoffCreateDto } from './dto/dayoff.dto';
import { Tour } from 'src/tour/entities/tour.entity';
import { Dayoff } from './entities/dayoff.entity';

@Injectable()
export class DayoffService {
  constructor(private readonly dayoffRepository: DayoffRepository) {}
  private readonly logger = new Logger(DayoffService.name);

  async createDayOff(
    dayoffCreateDto: DayoffCreateDto,
    tour: Tour,
  ): Promise<Dayoff[]> {
    const newDayoff = this.dayoffRepository.newDayoff(dayoffCreateDto, tour);
    return await this.dayoffRepository.createDayoff(newDayoff);
  }
}
