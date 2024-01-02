import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Dayoff } from './entities/dayoff.entity';
import { DayoffCreateDto } from './dto/dayoff.dto';
import { pick } from 'lodash';
import { Tour } from '../tour/entities/tour.entity';

export class DayoffRepository extends Repository<Dayoff> {
  constructor(
    @InjectRepository(Dayoff)
    private dayoffRepository: Repository<Dayoff>,
  ) {
    super(
      dayoffRepository.target,
      dayoffRepository.manager,
      dayoffRepository.queryRunner,
    );
  }

  public async findAll(): Promise<Dayoff[]> {
    return this.find();
  }

  public async findById(id: number): Promise<Dayoff | null> {
    return this.findOneBy({ id: id });
  }

  public async findByCondition(
    condition: FindOneOptions<Dayoff>,
  ): Promise<Dayoff | null> {
    return this.findOne(condition);
  }

  public newDayoff(dayoffDto: DayoffCreateDto, tour: Tour): Dayoff {
    const newDayoff = this.create(pick(dayoffDto, ['type', 'date', 'month']));
    newDayoff.tour = tour;
    newDayoff.dayOfWeek = dayoffDto.day;
    return newDayoff;
  }

  public async createDayoff(dayoff: Dayoff): Promise<Dayoff[]> {
    return this.save([dayoff]);
  }

  public async deleteTour(id: number): Promise<void> {
    await this.delete(id);
  }
}
