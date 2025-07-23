// src/hedera/dto/create-account.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsEmail,
  Length,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'alice123', description: "Nom d'utilisateur Hedera" })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'motdepasse123', description: 'Mot de passe du compte' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 128, { message: 'Le mot de passe doit contenir entre 6 et 128 caractères' })
  password!: string;

  @ApiProperty({
    example: 'alice@example.com',
    description: "Adresse email de l’utilisateur",
  })
  @IsEmail({}, { message: 'L\'email doit être une adresse valide' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'Alice Dupont',
    description: 'Nom complet (facultatif)',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    example: '302e020100300506032b657004220420d2b54...',
    description: 'Clé publique au format hexadécimal (facultative)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-fA-F]*$/, {
    message: 'La clé publique doit être une chaîne hexadécimale valide',
  })
  publicKey?: string;
}
