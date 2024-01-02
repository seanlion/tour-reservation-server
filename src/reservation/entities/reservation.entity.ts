import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReservationStatus } from '../types/status_enum';
import { Tour } from 'src/tour/entities/tour.entity';

@Entity({ name: 'reservations' })
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({
    type: 'enum',
    name: 'status',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ name: 'date', type: 'date' })
  date: string;

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
