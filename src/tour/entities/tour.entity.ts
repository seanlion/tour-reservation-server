import { Seller } from '../../seller/entities/seller.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  // dayoff >--o tour
}
