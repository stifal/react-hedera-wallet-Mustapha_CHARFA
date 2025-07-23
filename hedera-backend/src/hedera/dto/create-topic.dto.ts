// src/hedera/dto/create-topic.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTopicDto {
  @ApiPropertyOptional({ example: 'Mon Topic Hedera', description: 'Mémo du topic (optionnel)' })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ example: '0.0.1234', description: 'ID du compte créateur (pour log)' })
  @IsString()
  accountId!: string;
}
