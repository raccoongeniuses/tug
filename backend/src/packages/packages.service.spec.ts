import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { PackagesService } from './packages.service';
import {
  PackageCategory,
  PackageStatus,
  WellnessPackage,
} from './wellness-package.entity';

describe('PackagesService', () => {
  let service: PackagesService;
  let repo: jest.Mocked<Repository<WellnessPackage>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: getRepositoryToken(WellnessPackage),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn((dto: unknown) => dto),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PackagesService);
    repo = module.get(getRepositoryToken(WellnessPackage)) as jest.Mocked<
      Repository<WellnessPackage>
    >;
  });

  it('findAllAdmin orders by created_at descending', async () => {
    const list = [{ id: 1 } as WellnessPackage];
    repo.find.mockResolvedValue(list);

    await expect(service.findAllAdmin()).resolves.toEqual(list);
    expect(repo.find).toHaveBeenCalledWith({ order: { created_at: 'DESC' } });
  });

  it('findAllMobile filters by active status and optional category', async () => {
    repo.find.mockResolvedValue([]);

    await service.findAllMobile();
    expect(repo.find).toHaveBeenCalledWith({
      where: { status: PackageStatus.ACTIVE },
      order: { created_at: 'DESC' },
    });

    repo.find.mockClear();
    await service.findAllMobile(PackageCategory.FACIAL);
    expect(repo.find).toHaveBeenCalledWith({
      where: {
        status: PackageStatus.ACTIVE,
        category: PackageCategory.FACIAL,
      },
      order: { created_at: 'DESC' },
    });
  });

  it('findOneActive queries by id and active status', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOneActive(999)).resolves.toBeNull();
    expect(repo.findOneBy).toHaveBeenCalledWith({
      id: 999,
      status: PackageStatus.ACTIVE,
    });
  });

  it('create persists the entity and reloads it with DB defaults', async () => {
    const dto = {
      name: 'Hot Stone',
      price: 120,
      duration_minutes: 90,
    } as never;
    repo.create.mockReturnValue({ id: undefined, ...dto } as never);
    repo.save.mockResolvedValue({ id: 7, ...dto } as never);
    repo.findOneBy.mockResolvedValue({ id: 7, ...dto } as never);

    const result = await service.create(dto);

    expect(result.id).toBe(7);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 7 });
  });

  it('remove returns false when nothing was deleted', async () => {
    const deleteResult: DeleteResult = { affected: 0, raw: {} };
    repo.delete.mockResolvedValue(deleteResult);

    await expect(service.remove(4)).resolves.toBe(false);
    expect(repo.delete).toHaveBeenCalledWith(4);
  });

  it('remove returns true when a row was deleted', async () => {
    const deleteResult: DeleteResult = { affected: 1, raw: {} };
    repo.delete.mockResolvedValue(deleteResult);

    await expect(service.remove(4)).resolves.toBe(true);
  });
});
