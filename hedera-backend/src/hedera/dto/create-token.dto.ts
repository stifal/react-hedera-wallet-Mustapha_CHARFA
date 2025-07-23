// src/hedera/dto/create-token.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTokenDto {
  @ApiProperty({ example: 'Mon Token', description: 'Nom du token' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'MTK', description: 'Symbole du token' })
  @IsString()
  symbol!: string;

  @ApiPropertyOptional({ example: 0, description: 'Décimales du token (optionnel)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  decimals?: number;

  @ApiProperty({ example: 1000000, description: 'Quantité initiale de token' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  initialSupply!: number;

  @ApiProperty({ example: '0.0.1234', description: 'ID du compte créateur (pour log)' })
  @IsString()
  accountId!: string;
}
