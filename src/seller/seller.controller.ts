import { Body, Controller, Get, Post } from '@nestjs/common';
import { SellerDto, SellerRegisterDto } from './dto/seller.dto';
import { SellerService } from './seller.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Seller')
@Controller('/seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @ApiOperation({ description: 'View all sellers information' })
  @Get('/members')
  async fetchSellers(): Promise<SellerDto[]> {
    return await this.sellerService.fetchSellers();
  }

  @ApiOperation({ description: 'Register a seller' })
  @Post('/register')
  async registerSeller(
    @Body() registerDto: SellerRegisterDto,
  ): Promise<boolean> {
    return await this.sellerService.registerSeller(registerDto);
  }

  @ApiOperation({ description: 'Update the seller information' })
  @Post('/update')
  async updateSeller(@Body() updateDto: SellerDto): Promise<SellerDto> {
    return await this.sellerService.updateSeller(updateDto);
  }
}
