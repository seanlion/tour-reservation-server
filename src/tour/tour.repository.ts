import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { TourCreateDto, TourDto } from './dto/tour.dto';
import { Seller } from '../seller/entities/seller.entity';

export class TourRepository extends Repository<Tour> {
  constructor(
    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
  ) {
    super(
      tourRepository.target,
      tourRepository.manager,
      tourRepository.queryRunner,
    );
  }

  public async findAll(): Promise<Tour[]> {
    return this.find();
  }

  public async findByCondition(
    condition: FindManyOptions<Tour>,
  ): Promise<Tour[] | null> {
    return this.find(condition);
  }

  public async findById(id: number): Promise<Tour | null> {
    return this.findOneBy({ id: id });
  }

  public async findOneByCondition(
    condition: FindOneOptions<Tour>,
  ): Promise<Tour | null> {
    return this.findOne(condition);
  }

  public async createTour(
    tourDto: TourCreateDto,
    seller: Seller,
  ): Promise<Tour> {
    const newTour = this.create(tourDto);
    newTour.seller = seller;
    return this.save(newTour);
  }

  public async saveTour(tourDto: TourDto): Promise<Tour | undefined> {
    const tour = await this.findById(tourDto.id);
    if (!tour) return undefined;
    tour.title = tourDto.title;
    return this.save(tour);
  }

  public async deleteTour(id: number): Promise<void> {
    await this.delete(id);
  }
}
