import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { PackageCategory, PackageStatus } from '../wellness-package.entity';

export class CreatePackageDto {
  @ApiProperty({ example: 'Swedish Massage', minLength: 1, maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    example: 'A relaxing full-body massage.',
    required: false,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    example: 'https://example.com/massage.jpg',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(500)
  image_url?: string;

  @ApiProperty({ example: 89.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 60 })
  @IsInt()
  @Min(1)
  duration_minutes!: number;

  @ApiProperty({
    enum: PackageCategory,
    required: false,
    example: PackageCategory.MASSAGE,
    default: PackageCategory.MASSAGE,
  })
  @IsOptional()
  @IsEnum(PackageCategory)
  category?: PackageCategory;

  @ApiProperty({
    enum: PackageStatus,
    required: false,
    example: PackageStatus.DRAFT,
    default: PackageStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;
}
