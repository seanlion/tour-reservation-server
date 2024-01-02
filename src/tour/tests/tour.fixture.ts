import { Tour } from '../entities/tour.entity';
import { Seller } from '../../seller/entities/seller.entity';

export function createTourFixture(title: string = 'Test Tour'): Tour {
  const tour = new Tour();
  tour.id = Math.floor(Math.random() * 10000);
  tour.title = title;
  tour.createdAt = new Date();
  tour.updatedAt = new Date();

  tour.seller = new Seller();
  tour.seller.id = 1; // 예시 판매자 ID
  tour.seller.name = 'Test Seller';

  // Reservation과 Dayoff entity는 필요에 따라 추가
  tour.reservations = [];
  tour.dayoffs = [];

  return tour;
}
