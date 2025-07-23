import { ApiProperty } from '@nestjs/swagger';
import { NetworkInfoDto } from './network-info.dto';

export class NetworkStatusDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ type: NetworkInfoDto })
  networkInfo: NetworkInfoDto;

  constructor(status: string, timestamp: string, networkInfo: NetworkInfoDto) {
    this.status = status;
    this.timestamp = timestamp;
    this.networkInfo = networkInfo;
  }
}
