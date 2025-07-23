// src/hedera/dto/associate-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssociateTokenDto {
  @ApiProperty({ example: '0.0.1234', description: 'ID du compte à associer' })
  @IsString()
  accountId!: string;  // ajout de !

  @ApiProperty({ example: '302', description: 'ID du token à associer' })
  @IsString()
  tokenId!: string;  // ajout de !

  @ApiProperty({ example: '302-private-key', description: 'Clé privée du compte (string)' })
  @IsString()
  privateKey!: string;  // ajout de !
}
