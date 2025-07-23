import { Controller, Get } from '@nestjs/common';
import { HederaService } from '../hedera.service';
import { NetworkStatusDto } from '../dto/network-status.dto';

@Controller('hedera')
export class HederaController {
  constructor(private readonly hederaService: HederaService) {}

  @Get('status')
  async getStatus(): Promise<NetworkStatusDto> {
    return this.hederaService.getNetworkStatus();
  }
}


