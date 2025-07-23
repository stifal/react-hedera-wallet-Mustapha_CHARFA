import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: '302', description: 'ID du topic Hedera' })
  @IsString()
  topicId!: string;

  @ApiProperty({ example: 'Bonjour Hedera!', description: 'Message à envoyer' })
  @IsString()
  message!: string;

  @ApiProperty({ example: '0.0.1234', description: 'ID du compte émetteur (pour log)' })
  @IsString()
  accountId!: string;
}
