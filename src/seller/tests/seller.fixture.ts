import { Seller } from '../entities/seller.entity';
import { Tour } from '../../tour/entities/tour.entity';

export function createSellerFixture(
  id: number = Math.floor(Math.random() * 10000),
  name: string = `seller-${id}`,
  tours: Tour[] = [],
): Seller {
  const seller = new Seller();
  seller.id = id;
  seller.name = name;
  seller.createdAt = new Date();
  seller.updatedAt = new Date();
  seller.tour = tours;
  return seller;
}
