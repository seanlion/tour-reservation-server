import { Reservation } from '../../reservation/entities/reservation.entity';
import { Seller } from '../../seller/entities/seller.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dayoff } from '../../dayoff/entities/dayoff.entity';

@Entity({ name: 'tours' })
export class Tour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // tour >--o seller
  // JoinColumn 사용?
  @ManyToOne(() => Seller, (seller) => seller.tour, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  seller?: Seller;

  // reservation >--o tour
  @OneToMany(() => Reservation, (reservation) => reservation.tour, {
    nullable: false,
  })
  reservations: Reservation[];

  // dayoff >--o tour
  @OneToMany(() => Dayoff, (dayoff) => dayoff.tour)
  public dayoffs: Dayoff[];
}
