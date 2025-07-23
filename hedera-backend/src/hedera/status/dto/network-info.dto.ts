import { ApiProperty } from '@nestjs/swagger';
import { VersionInfoDto } from './version-info.dto';

export class NetworkInfoDto {
  @ApiProperty({ type: VersionInfoDto })
  servicesVersion: VersionInfoDto;

  @ApiProperty({ type: VersionInfoDto })
  protobufVersion: VersionInfoDto;

  constructor(servicesVersion: VersionInfoDto, protobufVersion: VersionInfoDto) {
    this.servicesVersion = servicesVersion;
    this.protobufVersion = protobufVersion;
  }
}
