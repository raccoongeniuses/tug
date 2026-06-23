import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Service health.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'tug-backend' },
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  health(): { name: string; status: string } {
    return { name: 'tug-backend', status: 'ok' };
  }
}
