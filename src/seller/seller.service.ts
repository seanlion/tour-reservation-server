import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SellerRegisterDto, SellerDto } from './dto/seller.dto';
import { SellerRepository } from './seller.repository';
import { SellerNotFoundException } from '../exception/SellerNotFoundException';

@Injectable()
export class SellerService {
  constructor(private readonly sellerRepository: SellerRepository) {}
  private readonly logger = new Logger(SellerService.name);

  async registerSeller(registerDto: SellerRegisterDto): Promise<boolean> {
    try {
      await this.sellerRepository.registerSeller({
        ...registerDto,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `SellerService:registerSeller: ${JSON.stringify(error.message)}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async updateSeller(updateDto: SellerDto): Promise<SellerDto> {
    try {
      const seller = await this.sellerRepository.updateSeller(updateDto);
      if (!seller) {
        throw new SellerNotFoundException();
      }
      return SellerDto.from(seller);
    } catch (error) {
      this.logger.error(
        `SellerService:updateSeller: ${JSON.stringify(error.message)}`,
      );
      if (error instanceof SellerNotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async fetchSellers(): Promise<SellerDto[]> {
    try {
      const sellers = await this.sellerRepository.findAll();
      if (!sellers) {
        return [];
      }
      return sellers.map((e) => SellerDto.from(e));
    } catch (error) {
      this.logger.error(
        `SellerService:fetchSellers: ${JSON.stringify(error.message)}`,
      );
      throw new InternalServerErrorException();
    }
  }
}
