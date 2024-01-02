import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DayoffType } from '../types/dayoff_type';
import { Tour } from 'src/tour/entities/tour.entity';

@Entity({ name: 'dayoffs' })
export class Dayoff {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'enum', enum: DayoffType })
  public type: DayoffType;

  @Column({ type: Number, nullable: true })
  public dayOfMonth: number | null;

  @Column({ type: Number, nullable: true })
  public dayOfWeek: number | null;

  @Column({ type: Number, nullable: true })
  public date: number | null;

  @ManyToOne(() => Tour, (tour) => tour.dayoffs)
  @JoinColumn({ name: 'tourId', referencedColumnName: 'id' })
  public tour: Tour;
}
