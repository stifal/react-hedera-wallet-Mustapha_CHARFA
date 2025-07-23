import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty({
    example: '0.0.123456',
    description: "Identifiant du compte Hedera",
  })
  accountId!: string;

  @ApiProperty({
    example: '302e020100300506032b657004220420d2b54...',
    description: "Clé publique du compte (au format hexadécimal)",
  })
  publicKey!: string;

  @ApiProperty({
    example: '302e...',
    description: 'Clé privée (optionnelle, peut être N/A si inconnue)',
    required: false,
  })
  privateKey?: string;

  @ApiProperty({
    example: 'mustapha',
    description: "Nom d'utilisateur lié au compte",
  })
  username!: string;

  @ApiProperty({
    example: '2025-07-21T23:03:00Z',
    description: "Horodatage de création du compte (au format ISO 8601)",
  })
  createdAt!: string;

  @ApiProperty({ required: false })
  initialBalance?: string;

  @ApiProperty({
    example: 'success',
    description: "Statut de la création du compte",
  })
  status!: string;
}
