import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { WellnessPackage } from './wellness-package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@ApiTags('admin-packages')
@Controller('admin/packages')
export class AdminPackagesController {
  constructor(private readonly service: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all packages (all statuses)' })
  @ApiResponse({
    status: 200,
    description: 'List of all wellness packages, newest first.',
    type: WellnessPackage,
    isArray: true,
  })
  findAll(): Promise<WellnessPackage[]> {
    return this.service.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single package by id (any status)' })
  @ApiResponse({
    status: 200,
    description: 'The wellness package.',
    type: WellnessPackage,
  })
  @ApiResponse({ status: 400, description: 'Invalid id.' })
  @ApiResponse({ status: 404, description: 'Package not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WellnessPackage> {
    const pkg = await this.service.findOneAdmin(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    return pkg;
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new wellness package' })
  @ApiResponse({
    status: 201,
    description: 'The created wellness package.',
    type: WellnessPackage,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  create(@Body() dto: CreatePackageDto): Promise<WellnessPackage> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing wellness package' })
  @ApiResponse({
    status: 200,
    description: 'The updated wellness package.',
    type: WellnessPackage,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Package not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePackageDto,
  ): Promise<WellnessPackage> {
    const pkg = await this.service.update(id, dto);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    return pkg;
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a wellness package (hard delete)' })
  @ApiResponse({ status: 204, description: 'Deleted, no content.' })
  @ApiResponse({ status: 404, description: 'Package not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const ok = await this.service.remove(id);
    if (!ok) {
      throw new NotFoundException('Package not found');
    }
  }
}
