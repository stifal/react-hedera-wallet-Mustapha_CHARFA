// src/hedera/dto/account-info.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class GetAccountInfo {
  @ApiProperty({ example: '0.0.1234', description: 'ID du compte Hedera' })
  @IsString()
  accountId!: string;

  @ApiProperty({ example: '302e...', description: 'Clé publique du compte Hedera' })
  @IsString()
  publicKey!: string;
}
