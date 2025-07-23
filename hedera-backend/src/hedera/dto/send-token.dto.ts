import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class SendTokenDto {
  @ApiProperty({ example: '0.0.1234', description: 'ID du compte émetteur' })
  @IsString()
  accountId!: string;

  @ApiProperty({ example: '0.0.5678', description: 'ID du compte destinataire' })
  @IsString()
  receiverId!: string;

  @ApiProperty({ example: '302', description: 'ID du token à envoyer' })
  @IsString()
  tokenId!: string;

  @ApiProperty({ example: 100, description: 'Quantité de tokens à envoyer' })
  @IsNumber()
  @Min(1)
  amount!: number;
}
