import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WellnessPackage } from './wellness-package.entity';
import { PackagesService } from './packages.service';
import { AdminPackagesController } from './admin-packages.controller';
import { MobilePackagesController } from './mobile-packages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WellnessPackage])],
  controllers: [AdminPackagesController, MobilePackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
