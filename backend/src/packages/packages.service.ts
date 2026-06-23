import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  PackageCategory,
  PackageStatus,
  WellnessPackage,
} from './wellness-package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(WellnessPackage)
    private readonly repo: Repository<WellnessPackage>,
  ) {}

  findAllAdmin(): Promise<WellnessPackage[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  findOneAdmin(id: number): Promise<WellnessPackage | null> {
    return this.repo.findOneBy({ id });
  }

  findAllMobile(category?: PackageCategory): Promise<WellnessPackage[]> {
    const where: FindOptionsWhere<WellnessPackage> = {
      status: PackageStatus.ACTIVE,
    };
    if (category) {
      where.category = category;
    }
    return this.repo.find({ where, order: { created_at: 'DESC' } });
  }

  findOneActive(id: number): Promise<WellnessPackage | null> {
    return this.repo.findOneBy({ id, status: PackageStatus.ACTIVE });
  }

  async create(dto: CreatePackageDto): Promise<WellnessPackage> {
    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    const reloaded = await this.repo.findOneBy({ id: saved.id });
    return reloaded ?? saved;
  }

  async update(id: number, dto: UpdatePackageDto): Promise<WellnessPackage | null> {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) {
      return null;
    }
    await this.repo.update(id, dto);
    return this.repo.findOneBy({ id });
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
