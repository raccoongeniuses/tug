import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PackageCategory } from '../wellness-package.entity';

export class MobileListQueryDto {
  @ApiProperty({
    enum: PackageCategory,
    required: false,
    example: PackageCategory.MASSAGE,
  })
  @IsOptional()
  @IsEnum(PackageCategory)
  category?: PackageCategory;
}
