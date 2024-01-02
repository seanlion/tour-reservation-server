import { IsNumber, IsString } from 'class-validator';
import { Seller } from '../entities/seller.entity';
import { pick } from 'lodash';

export class SellerRegisterDto {
  @IsString()
  name: string;
}

export class SellerDto {
  @IsNumber()
  id: number;

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
