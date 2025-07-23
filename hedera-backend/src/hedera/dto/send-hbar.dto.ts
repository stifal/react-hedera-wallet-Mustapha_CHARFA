import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class SendHbarDto {
  @ApiProperty({ example: '0.0.1234', description: 'ID du compte émetteur' })
  @IsString()
  senderId!: string;

  @ApiProperty()
  fromAccountId!: string;

  @ApiProperty()
  toAccountId!: string;

  @ApiProperty()
  amount!: string; // ou bigint

}