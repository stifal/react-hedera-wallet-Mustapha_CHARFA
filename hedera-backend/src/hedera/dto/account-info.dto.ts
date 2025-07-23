// src/hedera/dto/account-info.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class AccountInfoDto {
  @ApiProperty({ example: '0.0.1234', description: 'ID du compte Hedera' })
  @IsString()
  accountId!: string;

  @ApiProperty({ example: '302e...', description: 'Clé privée (optionnel)', required: false })
  @IsOptional()
  @IsString()
  privateKey?: string;

  @ApiProperty({ example: 'user123', description: "Nom d'utilisateur" })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email associé' })
  @IsString()
  email!: string;

  @ApiProperty({ example: '302e...', description: 'Clé publique du compte Hedera' })
  @IsOptional()
  @IsString()
  publicKey?: string;

  @ApiProperty({ example: 1000, description: 'Solde du compte' })
  @IsNumber()
  balance!: number;

  @ApiProperty({ example: '2025-07-22T10:00:00Z', description: 'Date de création' })
  @IsDate()
  createdAt!: Date;
}
