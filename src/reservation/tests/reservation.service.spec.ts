import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from '../reservation.service';
import { ReservationRepository } from '../reservation.repository';
import { TourService } from '../../tour/tour.service';
import { ReservationStatus } from '../types/status_enum';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ReservationNotFoundException } from '../../exception/ReservationNotFoundException';
import { AlreadyCanceledException } from '../../exception/AlreadyCanceledException';
import { CannotCanceledException } from '../../exception/CannotCanceledException';
import { AlreadyApprovedException } from '../../exception/AlreadyApprovedException';
import { NotAvailableScheduleException } from '../../exception/notAvailableScheduleException';
import { createTourFixture } from '../../tour/tests/tour.fixture';
import {
  createReservationApproveDtoFixture,
  createReservationCancelDtoFixture,
  createReservationCheckDtoFixture,
  createReservationFixture,
  createReservationRegisterDtoFixture,
  createReservationUpdateDtoFixture,
} from './reservation.fixture';
import { createDayoffFixture } from '../../tour/tests/dayoff.fixture';
import { Reservation } from '../entities/reservation.entity';
import { calculateDateDiff } from '../utils/date';

jest.mock('../utils/date.ts', () => ({
  ...jest.requireActual('../utils/date.ts'),
  calculateDateDiff: jest.fn(),
}));

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let tourService: jest.Mocked<TourService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: ReservationRepository,
          useValue: {
            findOneByCondition: jest.fn(),
            updateReservation: jest.fn(),
            createReservation: jest.fn(),
          },
        },
        {
          provide: TourService,
          useValue: { findTourWithReservationsAndDayoffs: jest.fn() },
        },
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    reservationRepository = module.get<ReservationRepository>(
      ReservationRepository,
    ) as jest.Mocked<ReservationRepository>;
    tourService = module.get<TourService>(
      TourService,
    ) as jest.Mocked<TourService>;
  });

  describe('registerReservation', () => {
    it('should successfully register a reservation', async () => {
      const tour = createTourFixture();
      const dayoff = createDayoffFixture();
      tour.dayoffs = [dayoff];
      const registerDto = createReservationRegisterDtoFixture();
      const mockReservation = createReservationFixture(
        ReservationStatus.APPROVED,
        tour,
      );
      tourService.findTourWithReservationsAndDayoffs.mockResolvedValue(tour);
      reservationRepository.createReservation.mockResolvedValue(
        mockReservation,
      );
    const result = await reservationService.registerReservation(tour.id, registerDto);
      expect(
        result.status
      ).toBe(ReservationStatus.APPROVED);
      expect(
        tourService.findTourWithReservationsAndDayoffs,
      ).toHaveBeenCalledWith(tour.id);
      expect(
        tourService.findTourWithReservationsAndDayoffs,
      ).toHaveBeenCalledTimes(1);
    });

    it('should throw error when tour is not found', async () => {
      const registerDto = createReservationRegisterDtoFixture();

      tourService.findTourWithReservationsAndDayoffs.mockRejectedValue(
        new Error('Tour not found'),
      );

      await expect(
        reservationService.registerReservation(1, registerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw NotAvailableScheduleException if the schedule is not available', async () => {
      const registerDto = createReservationRegisterDtoFixture();
      const tour = createTourFixture();
      const dayoff = createDayoffFixture({
        id: 1,
        month: 3,
        date: 2,
        tour: tour,
      });
      tour.dayoffs = [dayoff];

      tourService.findTourWithReservationsAndDayoffs.mockResolvedValue(tour);

      await expect(
        reservationService.registerReservation(tour.id, registerDto),
      ).rejects.toThrow(NotAvailableScheduleException);

      expect(
        tourService.findTourWithReservationsAndDayoffs,
      ).toHaveBeenCalledWith(tour.id);
    });
  });

  describe('approveReservation', () => {
    it('should successfully approve a pending reservation', async () => {
      const mockReservation = createReservationFixture(
        ReservationStatus.PENDING,
      );
      const approveDto = createReservationApproveDtoFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );
      const updatedReservation = {
        ...mockReservation,
        status: ReservationStatus.APPROVED,
      } as Reservation;
      reservationRepository.updateReservation.mockResolvedValue(
        updatedReservation,
      );

      const result = await reservationService.approveReservation(
        mockReservation.id,
        approveDto,
      );
      expect(result.status).toBe(ReservationStatus.APPROVED);
      expect(reservationRepository.findOneByCondition).toHaveBeenCalledWith({
        relations: { tour: { seller: true } },
        where: { id: mockReservation.id },
      });
      expect(reservationRepository.updateReservation).toHaveBeenCalledWith(
        mockReservation,
        { status: ReservationStatus.APPROVED, uuid: expect.any(String) },
        ['status', 'uuid'],
      );
    });

    it('should throw ReservationNotFoundException if reservation does not exist', async () => {
      const reservationId = 1;
      const approveDto = { sellerName: 'TestSeller' };

      reservationRepository.findOneByCondition.mockResolvedValue(null);

      await expect(
        reservationService.approveReservation(reservationId, approveDto),
      ).rejects.toThrow(ReservationNotFoundException);
    });

    it('should throw AlreadyApprovedException if reservation is already approved', async () => {
      const approveDto = { sellerName: 'TestSeller' };
      const mockReservation = createReservationFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      await expect(
        reservationService.approveReservation(mockReservation.id, approveDto),
      ).rejects.toThrow(AlreadyApprovedException);
    });

    it('should throw UnauthorizedException if seller names do not match', async () => {
      const mockReservation = createReservationFixture(
        ReservationStatus.PENDING,
      );
      const approveDto = { sellerName: 'AnotherSeller' };

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      await expect(
        reservationService.approveReservation(mockReservation.id, approveDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('cancelReservation', () => {
    it('should successfully cancel a reservation', async () => {
      const mockReservation = createReservationFixture();
      const cancelDto = createReservationCancelDtoFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );
      const updatedReservation = {
        ...mockReservation,
        status: ReservationStatus.CANCELED,
      } as Reservation;
      reservationRepository.updateReservation.mockResolvedValue(
        updatedReservation,
      );
      (calculateDateDiff as jest.Mock).mockReturnValue(4);

      const result = await reservationService.cancelReservation(
        mockReservation.id,
        cancelDto,
      );
      expect(result).toBe(true);
      expect(reservationRepository.findOneByCondition).toHaveBeenCalledWith({
        where: { id: mockReservation.id },
      });
      expect(reservationRepository.updateReservation).toHaveBeenCalledWith(
        mockReservation,
        { status: ReservationStatus.CANCELED },
        ['status'],
      );
    });

    it('should throw ReservationNotFoundException if reservation does not exist', async () => {
      const reservationId = 1;
      const cancelDto = createReservationCancelDtoFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(null);

      await expect(
        reservationService.cancelReservation(reservationId, cancelDto),
      ).rejects.toThrow(ReservationNotFoundException);
    });

    it('should throw AlreadyCanceledException if reservation is already canceled', async () => {
      const mockReservation = createReservationFixture(
        ReservationStatus.CANCELED,
      );
      const cancelDto = createReservationCancelDtoFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      await expect(
        reservationService.cancelReservation(mockReservation.id, cancelDto),
      ).rejects.toThrow(AlreadyCanceledException);
    });

    it('should throw UnauthorizedException for invalid user details', async () => {
      const cancelDto = {
        username: 'wrong user',
        phoneNumber: '01011112222',
        reservation_date: '2023-03-02',
      };
      const mockReservation = createReservationFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      await expect(
        reservationService.cancelReservation(mockReservation.id, cancelDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw CannotCanceledException if cancellation is not allowed', async () => {
      const reservationId = 1;
      const cancelDto = {
        username: 'John Doe',
        phoneNumber: '01012345678',
        reservation_date: '2023-03-02',
      };
      const mockReservation = createReservationFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      (calculateDateDiff as jest.Mock).mockReturnValue(2);

      await expect(
        reservationService.cancelReservation(reservationId, cancelDto),
      ).rejects.toThrow(CannotCanceledException);
    });
  });

  describe('fetchReservationByToken', () => {
    it('should successfully fetch a reservation by token', async () => {
      // APPROVED가 된 상황을 가정.
      const mockReservation = createReservationFixture();
      const checkDto = createReservationCheckDtoFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      const result = await reservationService.fetchReservationByToken(checkDto);
      expect(result.token).toBe(mockReservation.uuid);
      expect(result.status).toBe(ReservationStatus.APPROVED);
      expect(reservationRepository.findOneByCondition).toHaveBeenCalledWith({
        relations: { tour: { seller: true } },
        where: { uuid: checkDto.token },
      });
    });

    it('should throw UnauthorizedException if seller names do not match', async () => {
      const checkDto = {
        token: '123e4567-e89b-12d3-a456-426655440000',
        sellerName: 'Another Seller',
      };
      const mockReservation = createReservationFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      await expect(
        reservationService.fetchReservationByToken(checkDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return empty dto if reservation is not found', async () => {
      const checkDto = { token: 'invalid-token', sellerName: 'Test Seller' };

      reservationRepository.findOneByCondition.mockResolvedValue(null);

      const result = await reservationService.fetchReservationByToken(checkDto);
      expect(result.token).toBeUndefined();
    });
  });

  describe('updateReservation', () => {
    it('should successfully update a reservation', async () => {
      const updateDto = {
        username: 'John Doe',
        phoneNumber: '01012345678',
        original_reservation_date: '2023-03-02',
        update_reservation_date: '2023-03-05',
      };
      const mockTour = createTourFixture();
      const mockReservation = createReservationFixture(
        ReservationStatus.PENDING,
        mockTour,
      );

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );
      tourService.findTourWithReservationsAndDayoffs.mockResolvedValue(
        mockTour,
      );
      const updatedReservation = {
        ...mockReservation,
        reservationDate: updateDto.update_reservation_date,
        uuid: '123e4567-e89b-12d3-a456-426655440000',
        status: ReservationStatus.APPROVED,
        year: 2023,
        month: 3,
        date: 5,
      } as Reservation;

      reservationRepository.updateReservation.mockResolvedValue(
        updatedReservation,
      );

      const result = await reservationService.updateReservation(
        mockTour.id,
        updateDto,
      );
      expect(result).toBe(true);
      expect(reservationRepository.findOneByCondition).toHaveBeenCalledWith({
        relations: { tour: { seller: true } },
        where: {
          username: updateDto.username,
          phoneNumber: updateDto.phoneNumber,
          reservationDate: updateDto.original_reservation_date,
        },
      });
      expect(
        tourService.findTourWithReservationsAndDayoffs,
      ).toHaveBeenCalledWith(mockTour.id);
      expect(reservationRepository.updateReservation).toHaveBeenCalledWith(
        mockReservation,
        {
          reservationDate: updateDto.update_reservation_date,
          status: ReservationStatus.APPROVED, // or PENDING, based on your logic
          uuid: expect.any(String),
          year: expect.any(Number),
          month: expect.any(Number),
          date: expect.any(Number),
        },
        ['status', 'uuid', 'reservationDate', 'year', 'month', 'date'],
      );
    });

    it('should throw ReservationNotFoundException if reservation does not exist', async () => {
      const tourId = 1;
      const updateDto = createReservationUpdateDtoFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(null);

      await expect(
        reservationService.updateReservation(tourId, updateDto),
      ).rejects.toThrow(ReservationNotFoundException);
    });

    it('should throw UnauthorizedException for invalid user details', async () => {
      const mockTour = createTourFixture();
      const mockReservation = createReservationFixture(
        ReservationStatus.PENDING,
        mockTour,
      );
      const updateDto = {
        username: 'Another User',
        phoneNumber: '01012345999',
        original_reservation_date: '2023-03-02',
        update_reservation_date: '2023-03-05',
      };

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      await expect(
        reservationService.updateReservation(mockTour.id, updateDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw AlreadyApprovedException if reservation is already approved', async () => {
      const mockTour = createTourFixture();
      const mockReservation = createReservationFixture(
        ReservationStatus.APPROVED,
        mockTour,
      );
      const updateDto = createReservationUpdateDtoFixture();

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );

      await expect(
        reservationService.updateReservation(mockTour.id, updateDto),
      ).rejects.toThrow(AlreadyApprovedException);
    });

    it('should handle NotAvailableScheduleException when new date is not available', async () => {
      const mockTour = createTourFixture();
      const dayoff = createDayoffFixture({
        month: 3,
        date: 5,
        tour: mockTour,
      });
      mockTour.dayoffs = [dayoff];
      const updateDto = createReservationUpdateDtoFixture();
      const mockReservation = createReservationFixture(
        ReservationStatus.PENDING,
        mockTour,
      );

      reservationRepository.findOneByCondition.mockResolvedValue(
        mockReservation,
      );
      tourService.findTourWithReservationsAndDayoffs.mockResolvedValue(
        mockTour,
      );

      await expect(
        reservationService.updateReservation(mockTour.id, updateDto),
      ).rejects.toThrow(NotAvailableScheduleException);
    });
  });
});
