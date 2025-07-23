import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  IsISO8601,
  IsDefined,
} from 'class-validator';

/**
 * DTO représentant la version d’un composant Hedera (majeure, mineure, patch).
 */
export class VersionInfoDto {
  @ApiProperty({ example: 0, description: 'Version majeure' })
  @IsInt()
  @IsDefined()
  major!: number;

  @ApiProperty({ example: 63, description: 'Version mineure' })
  @IsInt()
  @IsDefined()
  minor!: number;

  @ApiProperty({ example: 9, description: 'Version patch' })
  @IsInt()
  @IsDefined()
  patch!: number;
}

/**
 * DTO contenant les versions des composants du réseau Hedera.
 */
export class NetworkInfoDto {
  @ApiProperty({ type: () => VersionInfoDto, description: 'Version des services Hedera' })
  @ValidateNested()
  @Type(() => VersionInfoDto)
  @IsDefined()
  servicesVersion!: VersionInfoDto;

  @ApiProperty({
    type: () => VersionInfoDto,
    required: false,
    description: 'Version du protocole Protobuf (optionnel)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VersionInfoDto)
  protobufVersion?: VersionInfoDto;
}

/**
 * DTO global représentant le statut du réseau Hedera,
 * incluant le statut, le timestamp et les infos réseau.
 */
export class NetworkStatusDto {
  @ApiProperty({ example: 'OK', description: 'Statut global du réseau Hedera' })
  @IsString()
  @IsDefined()
  status!: string;

  @ApiProperty({
    example: '2025-07-21T18:20:32.942Z',
    description: 'Horodatage ISO 8601 du statut réseau',
  })
  @IsISO8601()
  @IsDefined()
  timestamp!: string;

  @ApiProperty({ type: () => NetworkInfoDto, description: 'Informations détaillées sur le réseau' })
  @ValidateNested()
  @Type(() => NetworkInfoDto)
  @IsDefined()
  networkInfo!: NetworkInfoDto;
}
