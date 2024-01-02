import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationPayload } from './types/payload';
import { pick } from 'lodash';

export class ReservationRepository extends Repository<Reservation> {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {
    super(
      reservationRepository.target,
      reservationRepository.manager,
      reservationRepository.queryRunner,
    );
  }

  public async findAll(): Promise<Reservation[]> {
    return this.find();
  }

  public async findByCondition(
    condition: FindManyOptions<Reservation>,
  ): Promise<Reservation[] | null> {
    return this.find(condition);
  }

  public async findById(id: number): Promise<Reservation | null> {
    return this.findOneBy({ id: id });
  }

  public async findOneByCondition(
    condition: FindOneOptions<Reservation>,
  ): Promise<Reservation | null> {
    return this.findOne(condition);
  }

  public async createReservation(
    reservationPayload: ReservationPayload,
  ): Promise<Reservation> {
    const newReservation = this.create(reservationPayload);
    return this.save(newReservation);
  }

  public async updateReservation(
    reservation: Reservation,
    reservationPayload: ReservationPayload,
    fieldsToUpdate: Array<keyof ReservationPayload>,
  ): Promise<Reservation | undefined> {
    const filteredPayload = pick(reservationPayload, fieldsToUpdate);
    Object.assign(reservation, filteredPayload);
    return this.save(reservation);
  }

  public async deleteReservation(id: number): Promise<void> {
    await this.delete(id);
  }
}
