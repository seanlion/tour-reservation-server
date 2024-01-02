import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { TourService } from '../tour.service';
import { TourRepository } from '../tour.repository';
import { SellerService } from '../../seller/seller.service';
import { createSellerFixture } from '../../seller/tests/seller.fixture';
import { SellerNotFoundException } from '../../exception/SellerNotFoundException';
import { createTourFixture } from './tour.fixture';
import { TourNotFoundException } from '../../exception/TourNotFoundException';
import { DayoffService } from '../../dayoff/dayoff.service';
import { createDayoffFixture } from './dayoff.fixture';
import { DayoffType } from '../../dayoff/types/dayoff_type';
import { getAllDatesInGivenMonth } from '../utils/util';

describe('TourService', () => {
  let tourService: TourService;
  let mockTourRepository;
  let mockSellerService;
  let mockDayoffService;

  beforeEach(async () => {
    mockTourRepository = {
      createTour: jest.fn(),
      saveTour: jest.fn(),
      findById: jest.fn(),
      findByCondition: jest.fn(),
      findOneByCondition: jest.fn(),
    };
    mockSellerService = { fetchSeller: jest.fn() };
    mockDayoffService = { createDayOff: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourService,
        { provide: TourRepository, useValue: mockTourRepository },
        { provide: SellerService, useValue: mockSellerService },
        { provide: DayoffService, useValue: mockDayoffService },
      ],
    }).compile();

    tourService = module.get<TourService>(TourService);
  });

  describe('addTour', () => {
    it('should successfully add a tour', async () => {
      const testSeller = createSellerFixture();
      mockSellerService.fetchSeller.mockResolvedValue(testSeller);
      mockTourRepository.createTour.mockResolvedValue(true);
      const createTourDto = {
        title: 'Test tour',
        sellerName: testSeller.name,
      };
      await expect(
        tourService.addTourBySeller(createTourDto),
      ).resolves.toBeTruthy();
    });

    it('should throw an error if fetching seller fails', async () => {
      mockSellerService.fetchSeller.mockRejectedValue(
        new SellerNotFoundException(),
      );
      const createTourDto = {
        title: 'Test tour',
        sellerName: 'testee',
      };
      await expect(tourService.addTourBySeller(createTourDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw an error if creating tour fails', async () => {
      const testSeller = createSellerFixture();
      mockSellerService.fetchSeller.mockResolvedValue(testSeller);
      mockTourRepository.createTour.mockRejectedValue(
        new Error('Create tour failed'),
      );
      const createTourDto = {
        title: 'Test tour',
        sellerName: 'testee',
      };
      await expect(tourService.addTourBySeller(createTourDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateTourBySeller', () => {
    it('should successfully update a tour', async () => {
      const TitleToBeUpdated = 'Updated Tour';
      const testTour = createTourFixture();
      testTour.title = TitleToBeUpdated;
      mockTourRepository.saveTour.mockResolvedValue(testTour);
      const updateTourDto = {
        id: testTour.id,
        sellerName: testTour.seller.name,
        title: TitleToBeUpdated,
      };
      const updatedTour = await tourService.updateTourBySeller(
        testTour.id,
        updateTourDto,
      );
      expect(updatedTour.title).toBe(TitleToBeUpdated);
    });

    it('should throw a TourNotFoundException for a non-existent tour', async () => {
      const TitleToBeUpdated = 'Updated Tour';
      const testTour = createTourFixture();
      mockTourRepository.saveTour.mockResolvedValue(null);
      const updateTourDto = {
        id: testTour.id,
        sellerName: testTour.seller.name,
        title: TitleToBeUpdated,
      };
      await expect(
        tourService.updateTourBySeller(testTour.id, updateTourDto),
      ).rejects.toThrow(TourNotFoundException);
    });
  });

  describe('addTourDayoff', () => {
    it('should successfully add a dayoff', async () => {
      const testTour = createTourFixture();
      const testDayoffs = createDayoffFixture();
      mockTourRepository.findById.mockResolvedValue(testTour);
      mockDayoffService.createDayOff.mockResolvedValue(testDayoffs);
      // addDayoffDto 필요
      const addDayoffDto = {
        sellerName: testTour.seller.name,
        tourId: testTour.id,
        type: DayoffType.DATE,
        month: 3,
        date: 1,
      };
      await expect(
        tourService.addTourDayoff(addDayoffDto),
      ).resolves.toBeTruthy();
    });

    it('should throw TourNotFoundException for a non-existent tour', async () => {
      mockTourRepository.findById.mockResolvedValue(null);
      const addDayoffDto = {
        sellerName: 'non-existent',
        tourId: 1,
        type: DayoffType.DATE,
        month: 3,
        date: 1,
      };
      await expect(tourService.addTourDayoff(addDayoffDto)).rejects.toThrow(
        TourNotFoundException,
      );
    });
  });

  describe('fetchToursBySeller', () => {
    it('should return a list of tours for a seller', async () => {
      const tours = Array.from({ length: 2 }, () => createTourFixture());
      mockTourRepository.findByCondition.mockResolvedValue(tours);
      const sellerName = 'Test Seller';
      const toursByTestSeller =
        await tourService.fetchToursBySeller(sellerName);
      expect(toursByTestSeller[0].sellerName).toBe(sellerName);
    });

    it('should throw an InternalServerErrorException on failure', async () => {
      mockTourRepository.findByCondition.mockRejectedValue(new Error('Error'));
      const sellerName = 'Test Seller';
      await expect(tourService.fetchToursBySeller(sellerName)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('fetchTourBySeller', () => {
    it('should return a tour for a given seller and tour ID', async () => {
      const testTour = createTourFixture();
      mockTourRepository.findOneByCondition.mockResolvedValue(testTour);
      const tourDtoReturnValue = await tourService.fetchTourBySeller(
        testTour.seller.name,
        testTour.id,
      );
      expect(tourDtoReturnValue.title).toBe(testTour.title);
    });

    it('should throw an InternalServerErrorException on failure', async () => {
      mockTourRepository.findOneByCondition.mockRejectedValue(
        new Error('Error'),
      );
      const testTour = createTourFixture();
      await expect(
        tourService.fetchTourBySeller('some seller', testTour.id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('TourService.fetchAvailableScheduleByTour', () => {
    it('should return available schedule for a tour', async () => {
      const testTour = createTourFixture();
      // dayoff를 2개 만들기
      const givenMonth = 3;
      const testDayoff1 = createDayoffFixture({
        id: 1,
        type: DayoffType.DATE,
        month: givenMonth,
        date: 2,
        tour: testTour,
      });
      const testDayoff2 = createDayoffFixture({
        id: 2,
        type: DayoffType.WEEKLY,
        month: givenMonth,
        dayOfWeek: 0,
        tour: testTour,
      });
      testTour.dayoffs = [testDayoff1, testDayoff2];
      mockTourRepository.findOneByCondition.mockResolvedValue(testTour);
      // 휴일은 총 5개(일요일 4개, 3/2일 1개)
      const availableScheduleDto =
        await tourService.fetchAvailableScheduleByTour(
          testTour.seller.name,
          testTour.id,
          2023,
          givenMonth,
        );
      const datesInGivenMonth = getAllDatesInGivenMonth(2023, 3);
      expect(availableScheduleDto.availableSchedule.length).toBe(
        datesInGivenMonth.length - 5,
      );
    });

    it('should throw an InternalServerErrorException on failure', async () => {
      mockTourRepository.findOneByCondition.mockRejectedValue(
        new Error('Error'),
      );
      const testTour = createTourFixture();
      await expect(
        tourService.fetchAvailableScheduleByTour(
          testTour.seller.name,
          testTour.id,
          2023,
          3,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
