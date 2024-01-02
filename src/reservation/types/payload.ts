import { Tour } from 'src/tour/entities/tour.entity';
import { ReservationStatus } from './status_enum';

export type ReservationPayload = {
  username?: string;
  phoneNumber?: string;
  tour?: Tour;
  status?: ReservationStatus;
  uuid?: string;
  year?: number;
  month?: number;
  date?: number;
  reservationDate?: string;
};
