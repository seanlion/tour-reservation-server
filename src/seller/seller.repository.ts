import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { SellerRegisterDto, SellerDto } from './dto/seller.dto';

export class SellerRepository extends Repository<Seller> {
  constructor(
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
  ) {
    super(
      sellerRepository.target,
      sellerRepository.manager,
      sellerRepository.queryRunner,
    );
  }

  public async findAll(): Promise<Seller[]> {
    return this.find();
  }

  public async findById(id: number): Promise<Seller | null> {
    return this.findOneBy({ id: id });
  }

  public async findByCondition(
    condition: FindOneOptions<Seller>,
  ): Promise<Seller | null> {
    return this.findOne(condition);
  }

  public async registerSeller(sellerDto: SellerRegisterDto): Promise<Seller> {
    const newSeller = this.create(sellerDto);
    return this.save(newSeller);
  }

  public async updateSeller(sellerDto: SellerDto): Promise<Seller | undefined> {
    const seller = await this.findById(sellerDto.id);
    if (!seller) return undefined;
    seller.name = sellerDto.name;
    return this.save(seller);
  }

  public async deleteSeller(id: number): Promise<void> {
    await this.delete(id);
  }
}
