import { ApiProperty } from '@nestjs/swagger';

export class VersionInfoDto {
  @ApiProperty()
  major: number;

  @ApiProperty()
  minor: number;

  @ApiProperty()
  patch: number;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }
}
