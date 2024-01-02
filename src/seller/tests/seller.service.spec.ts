import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { SellerNotFoundException } from '../../exception/SellerNotFoundException';
import { SellerService } from '../seller.service';
import { SellerRepository } from '../seller.repository';
import { createSellerFixture } from './seller.fixture';

describe('SellerService', () => {
  let service: SellerService;
  let repository: SellerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerService,
        {
          provide: SellerRepository,
          useValue: {
            registerSeller: jest.fn(),
            updateSeller: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SellerService>(SellerService);
    repository = module.get<SellerRepository>(SellerRepository);
  });

  // ... 이전 테스트 케이스 ...

  describe('registerSeller', () => {
    it('should successfully register a seller', async () => {
      const registerDto = { name: 'Testee' };
      const newSeller = createSellerFixture();
      jest.spyOn(repository, 'registerSeller').mockResolvedValue(newSeller);
      await expect(service.registerSeller(registerDto)).resolves.toBeTruthy();
    });

    it('should throw an error if registration fails', async () => {
      const registerDto = { name: 'Testee' };
      jest.spyOn(repository, 'registerSeller').mockRejectedValue(new Error());
      await expect(service.registerSeller(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateSeller', () => {
    it('should successfully update a seller', async () => {
      const newSeller = createSellerFixture();

      const updateDto = { name: 'Updatee', id: newSeller.id };
      newSeller.name = updateDto.name;
      newSeller.updatedAt = new Date();
      const updatedSeller = newSeller;
      jest.spyOn(repository, 'updateSeller').mockResolvedValue(updatedSeller);
      await expect(service.updateSeller(updateDto)).resolves.toEqual(updateDto);
    });

    it('should throw SellerNotFoundException if seller not found', async () => {
      const newSeller = createSellerFixture();

      const updateDto = { name: 'Updatee', id: newSeller.id };
      jest.spyOn(repository, 'updateSeller').mockResolvedValue(undefined);
      await expect(service.updateSeller(updateDto)).rejects.toThrow(
        SellerNotFoundException,
      );
    });

    it('should throw an InternalServerErrorException for unexpected errors', async () => {
      const newSeller = createSellerFixture();

      const updateDto = { name: 'Updatee', id: newSeller.id };
      jest
        .spyOn(repository, 'updateSeller')
        .mockRejectedValue(new Error('Unexpected Error'));

      await expect(service.updateSeller(updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('fetchSellers', () => {
    it('should return an array of sellers', async () => {
      const newSellers = Array.from({ length: 3 }, () => createSellerFixture());
      jest.spyOn(repository, 'findAll').mockResolvedValue(newSellers);
      const sellers = await service.fetchSellers();
      expect(sellers.length).toBe(3);
    });

    it('should return an empty array if no sellers found', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([]);
      await expect(service.fetchSellers()).resolves.toEqual([]);
    });

    it('should throw an InternalServerErrorException for unexpected errors', async () => {
      jest
        .spyOn(repository, 'findAll')
        .mockRejectedValue(new Error('Unexpected Error'));
      await expect(service.fetchSellers()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
