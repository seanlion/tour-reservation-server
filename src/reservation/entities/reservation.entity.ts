import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReservationStatus } from '../types/status_enum';
import { Tour } from '../../tour/entities/tour.entity';

@Entity({ name: 'reservations' })
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_uuid', unique: true, nullable: true })
  uuid?: string;

  @Column({
    type: 'enum',
    name: 'status',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ name: 'reservation_date' })
  reservationDate: string;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  date: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 고객 이름
  @Column()
  username: string;

  // 고객 전화번호
  @Column()
  phoneNumber: string;

  @ManyToOne(() => Tour, (tour) => tour.reservations, {
    nullable: false,
  })
  tour: Tour;
}
