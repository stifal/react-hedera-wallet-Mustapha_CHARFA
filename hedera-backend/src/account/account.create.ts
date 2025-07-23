import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { HederaService } from '../hedera/hedera.service';
import { CreateAccountDto } from '../hedera/dto/create-account.dto';
import { SendHbarDto } from '../hedera/dto/send-hbar.dto';
import { AccountInfoDto } from '../hedera/dto/account-info.dto';

@ApiTags('Hedera - Comptes')
@Controller('account')
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private readonly hederaService: HederaService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer un compte Hedera' })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async createAccount(@Body() dto: CreateAccountDto) {
    try {
      const result = await this.hederaService.createAccount(dto);
      return {
        message: 'Compte créé avec succès',
        data: result,
      };
    } catch (error) {
      const msg = (error as Error).message || 'Erreur lors de la création du compte';
      this.logger.error(`createAccount failed: ${msg}`, error as any);
      throw new HttpException({ message: msg }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('info')
  @ApiOperation({ summary: 'Obtenir les informations d’un compte Hedera' })
  @ApiQuery({ name: 'accountId', type: String, required: true })
  @ApiQuery({ name: 'privateKey', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Informations récupérées avec succès' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  async getAccountInfo(
    @Query('accountId') accountId: string,
    @Query('privateKey') privateKey: string,
  ) {
    if (!accountId || !privateKey) {
      throw new HttpException(
        { message: 'accountId et privateKey sont requis' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // On construit un DTO minimal avec ce qui est nécessaire
      const dto: AccountInfoDto = {
        accountId,
        privateKey,
        username: '', // valeurs optionnelles laissées vides ici
        email: '',
        publicKey: '',
        balance: 0,
        createdAt: new Date(), // placeholder, non utilisé dans getAccountInfo ici
      };

      const info = await this.hederaService.getAccountInfo(dto);

      return {
        message: 'Informations du compte récupérées',
        data: info,
      };
    } catch (error) {
      const msg = (error as Error).message || 'Erreur lors de la récupération des informations';
      this.logger.error(`getAccountInfo failed: ${msg}`, error as any);
      throw new HttpException({ message: msg }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transférer des HBARs entre deux comptes' })
  @ApiResponse({ status: 201, description: 'Transfert effectué avec succès' })
  @ApiResponse({ status: 400, description: 'Erreur lors du transfert' })
  async transferHbar(@Body() dto: SendHbarDto) {
    try {
      const result = await this.hederaService.sendHbar(dto);
      return {
        message: 'Transfert HBAR effectué avec succès',
        data: result,
      };
    } catch (error) {
      const msg = (error as Error).message || 'Erreur lors du transfert de HBAR';
      this.logger.error(`transferHbar failed: ${msg}`, error as any);
      throw new HttpException({ message: msg }, HttpStatus.BAD_REQUEST);
    }
  }
}
