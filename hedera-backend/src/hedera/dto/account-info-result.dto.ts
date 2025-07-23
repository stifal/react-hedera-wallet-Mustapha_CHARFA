import { ApiProperty } from '@nestjs/swagger';

export class AccountInfoResultDto {
  @ApiProperty()
  accountId: string = '';   // initialisé à chaîne vide par défaut

  @ApiProperty()
  balance: string = '';     // initialisé à chaîne vide par défaut

  @ApiProperty({ type: [String] })
  tokens: string[] = [];    // initialisé à tableau vide par défaut
}
