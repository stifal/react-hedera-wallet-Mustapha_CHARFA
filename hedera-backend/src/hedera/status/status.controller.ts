import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NetworkStatusDto } from '../dto/network-status.dto';
import { StatusService } from './status.service';

@ApiTags('Status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Statut du réseau Hedera' })
  @ApiResponse({ status: 200, type: NetworkStatusDto })
  getStatus(): NetworkStatusDto {
    const status = this.statusService.getStatus();
    if (!status) {
      return {
        status: 'UNAVAILABLE',
        timestamp: new Date().toISOString(),
        networkInfo: null,
      } as any;
    }
    return status;
  }
}
