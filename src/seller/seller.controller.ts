import { Body, Controller, Get, Post } from '@nestjs/common';
import { SellerDto, SellerRegisterDto } from './dto/seller.dto';
import { SellerService } from './seller.service';

@Controller('/seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}
  @Get('/members')
  async fetchSellers(): Promise<SellerDto[]> {
    return await this.sellerService.fetchSellers();
  }

  @Post('/register')
  async registerSeller(
    @Body() registerDto: SellerRegisterDto,
  ): Promise<boolean> {
    return await this.sellerService.registerSeller(registerDto);
  }

  @Post('/update')
  async updateSeller(@Body() updateDto: SellerDto): Promise<SellerDto> {
    return await this.sellerService.updateSeller(updateDto);
  }
}
