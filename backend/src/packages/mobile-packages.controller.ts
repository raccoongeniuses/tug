import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { MobilePackageDto } from './dto/mobile-package.dto';
import { MobileListQueryDto } from './dto/mobile-list-query.dto';

@ApiTags('mobile-packages')
@Controller('mobile/packages')
export class MobilePackagesController {
  constructor(private readonly service: PackagesService) {}

  @Get()
  @ApiOperation({
    summary: 'List active packages, newest first (optional category filter)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active wellness packages (audit fields excluded).',
    type: MobilePackageDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Invalid category filter.' })
  async findAll(
    @Query() query: MobileListQueryDto,
  ): Promise<MobilePackageDto[]> {
    const packages = await this.service.findAllMobile(query.category);
    return MobilePackageDto.fromEntities(packages);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single active package by id' })
  @ApiResponse({
    status: 200,
    description: 'The active wellness package (audit fields excluded).',
    type: MobilePackageDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid id.' })
  @ApiResponse({ status: 404, description: 'Active package not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MobilePackageDto> {
    const pkg = await this.service.findOneActive(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    return MobilePackageDto.fromEntity(pkg);
  }
}
