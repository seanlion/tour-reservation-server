import { IsNumber, IsString } from 'class-validator';
import { Seller } from '../entities/seller.entity';
import { pick } from 'lodash';
import { ApiProperty } from '@nestjs/swagger';

export class SellerRegisterDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class SellerDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  static from(seller: Seller): SellerDto {
    const sellerDto = new SellerDto();
    Object.assign(sellerDto, pick(seller, ['id', 'name']));
    return sellerDto;
  }
}

export class SellerPayload {
  name: string;
}
