import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PackageCategory {
  MASSAGE = 'massage',
  FACIAL = 'facial',
  BODY = 'body',
  MEDITATION = 'meditation',
}

export enum PackageStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('wellness_packages')
@Index('idx_packages_status', ['status'])
@Index('idx_packages_category', ['category'])
@Index('idx_packages_created_at', ['created_at'])
export class WellnessPackage {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @ApiProperty({ example: 'Swedish Massage' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ example: 'A relaxing full-body massage.', nullable: true })
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 89.0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | number | null) =>
        value === null || value === undefined ? null : Number(value),
    },
  })
  price!: number;

  @ApiProperty({ example: 60 })
  @Column({ type: 'int', unsigned: true })
  duration_minutes!: number;

  @ApiProperty({
    example: 'https://cdn.example.com/massage.jpg',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url!: string | null;

  @ApiProperty({ enum: PackageCategory, example: PackageCategory.MASSAGE })
  @Column({ type: 'enum', enum: PackageCategory, default: PackageCategory.MASSAGE })
  category!: PackageCategory;

  @ApiProperty({ enum: PackageStatus, example: PackageStatus.DRAFT })
  @Column({ type: 'enum', enum: PackageStatus, default: PackageStatus.DRAFT })
  status!: PackageStatus;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  created_at!: Date;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  @UpdateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: () => 'CURRENT_TIMESTAMP(3)',
  })
  updated_at!: Date;

  @ApiProperty({ example: 'admin@example.com', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by!: string | null;
}
