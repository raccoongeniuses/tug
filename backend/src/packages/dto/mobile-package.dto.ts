import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { WellnessPackage } from '../wellness-package.entity';

export class MobilePackageDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id!: number;

  @Expose()
  @ApiProperty({ example: 'Swedish Massage' })
  name!: string;

  @Expose()
  @ApiProperty({ example: 'A relaxing full-body massage.', nullable: true })
  description!: string | null;

  @Expose()
  @ApiProperty({ example: 89.0 })
  price!: number;

  @Expose()
  @ApiProperty({ example: 60 })
  duration_minutes!: number;

  @Expose()
  @ApiProperty({
    example: 'https://cdn.example.com/massage.jpg',
    nullable: true,
  })
  image_url!: string | null;

  @Expose()
  @ApiProperty({
    enum: ['massage', 'facial', 'body', 'meditation'],
    example: 'massage',
  })
  category!: string;

  @Expose()
  @ApiProperty({ enum: ['draft', 'active', 'archived'], example: 'active' })
  status!: string;

  @Expose()
  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  created_at!: Date;

  @Expose()
  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  updated_at!: Date;

  static fromEntity(entity: WellnessPackage): MobilePackageDto {
    return plainToInstance(MobilePackageDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: WellnessPackage[]): MobilePackageDto[] {
    return plainToInstance(MobilePackageDto, entities, {
      excludeExtraneousValues: true,
    });
  }
}
