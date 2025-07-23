import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { HederaService } from './hedera.service';

import {
  SendHbarDto,
  CreateTokenDto,
  AssociateTokenDto,
  SendTokenDto,
  CreateTopicDto,
  SendMessageDto,
  AccountInfoDto,
  NetworkStatusDto,
  CreateAccountDto,
  AccountResponseDto,
} from './dto';

import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../auth/guards/roles.enum';

@ApiTags('Hedera')
@ApiExtraModels(NetworkStatusDto, CreateAccountDto, AccountResponseDto)
@Controller('hedera')
export class HederaController {
  constructor(private readonly hederaService: HederaService) {}

  private handleError(
    error: unknown,
    defaultMessage: string,
    status = HttpStatus.BAD_REQUEST,
  ): never {
    const message = error instanceof Error ? error.message : defaultMessage;
    throw new HttpException({ statusCode: status, message }, status);
  }

  // ────────────────────────────────
  // 🚀 Public Endpoints
  // ────────────────────────────────

  @Get('ping')
  @ApiOperation({ summary: 'Ping - Vérifie que l’API est active' })
  @ApiOkResponse({
    description: 'API opérationnelle',
    schema: { example: { message: 'Hedera API is running ✅' } },
  })
  ping() {
    return { message: 'Hedera API is running ✅' };
  }

  @Get('status')
  @ApiOperation({ summary: 'Statut du réseau Hedera' })
  @ApiOkResponse({ type: NetworkStatusDto })
  async getStatus(): Promise<NetworkStatusDto> {
    try {
      return await this.hederaService.getNetworkStatus();
    } catch (error) {
      this.handleError(
        error,
        'Erreur lors de la récupération du statut réseau',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create-account')
  @ApiOperation({ summary: 'Créer un compte Hedera' })
  @ApiResponse({ status: 201, description: 'Compte créé', type: AccountResponseDto })
  @ApiBadRequestResponse({ description: 'Erreur de création de compte' })
  async createAccount(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    try {
      return await this.hederaService.createAccount(dto);
    } catch (error) {
      this.handleError(error, 'Erreur lors de la création du compte');
    }
  }

  @Post('hbar/send')
  @ApiOperation({ summary: 'Envoyer des HBAR' })
  @ApiBody({ type: SendHbarDto })
  @ApiOkResponse({
    description: 'Transaction réussie',
    schema: { example: { status: 'SUCCESS', transactionId: '...' } },
  })
  async sendHbar(@Body() dto: SendHbarDto) {
    try {
      return await this.hederaService.sendHbar(dto);
    } catch (error) {
      this.handleError(error, 'Erreur lors du transfert HBAR');
    }
  }

  @Post('account/info')
  @ApiOperation({ summary: 'Récupérer les infos d’un compte' })
  @ApiBody({ type: AccountInfoDto })
  @ApiOkResponse({
    description: 'Infos récupérées',
    schema: {
      example: {
        accountId: '0.0.1234',
        publicKey: '302e...',
        isReceiverSignatureRequired: false,
        tokens: ['0.0.5678'],
      },
    },
  })
  async getAccountInfo(@Body() dto: AccountInfoDto) {
    try {
      return await this.hederaService.getAccountInfo(dto);
    } catch (error) {
      this.handleError(error, "Erreur lors de la récupération des infos");
    }
  }

  @Post('token/create')
  @ApiOperation({ summary: 'Créer un token Hedera' })
  @ApiBody({ type: CreateTokenDto })
  @ApiOkResponse({
    description: 'Token créé',
    schema: { example: { tokenId: '0.0.12345', status: 'SUCCESS' } },
  })
  async createToken(@Body() dto: CreateTokenDto) {
    try {
      return await this.hederaService.createToken(dto);
    } catch (error) {
      this.handleError(error, 'Erreur lors de la création du token');
    }
  }

  @Post('token/associate')
  @ApiOperation({ summary: 'Associer un token à un compte' })
  @ApiBody({ type: AssociateTokenDto })
  @ApiOkResponse({ description: 'Association réussie', schema: { example: { status: 'SUCCESS' } } })
  async associateToken(@Body() dto: AssociateTokenDto) {
    try {
      return await this.hederaService.associateToken(dto);
    } catch (error) {
      this.handleError(error, "Erreur lors de l'association du token");
    }
  }

  @Post('token/send')
  @ApiOperation({ summary: 'Envoyer un token' })
  @ApiBody({ type: SendTokenDto })
  @ApiOkResponse({
    description: 'Token envoyé',
    schema: { example: { status: 'SUCCESS', transactionId: '...' } },
  })
  async sendToken(@Body() dto: SendTokenDto) {
    try {
      return await this.hederaService.sendToken(dto);
    } catch (error) {
      this.handleError(error, 'Erreur lors de l’envoi du token');
    }
  }

  @Post('topic/create')
  @ApiOperation({ summary: 'Créer un topic' })
  @ApiBody({ type: CreateTopicDto })
  @ApiOkResponse({ description: 'Topic créé', schema: { example: { topicId: '0.0.54321', status: 'SUCCESS' } } })
  async createTopic(@Body() dto: CreateTopicDto) {
    try {
      return await this.hederaService.createTopic(dto);
    } catch (error) {
      this.handleError(error, 'Erreur lors de la création du topic');
    }
  }

  @Post('message/send')
  @ApiOperation({ summary: 'Envoyer un message dans un topic' })
  @ApiBody({ type: SendMessageDto })
  @ApiOkResponse({
    description: 'Message envoyé',
    schema: { example: { status: 'SUCCESS', consensusTimestamp: '...' } },
  })
  async sendMessage(@Body() dto: SendMessageDto) {
    try {
      return await this.hederaService.sendMessage(dto);
    } catch (error) {
      this.handleError(error, "Erreur lors de l'envoi du message");
    }
  }

  // ────────────────────────────────
  // 🔒 Authenticated Endpoints
  // ────────────────────────────────

  @Get('account/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir un compte Hedera par ID' })
  @ApiOkResponse({ type: AccountResponseDto })
  async getAccount(@Param('accountId') accountId: string): Promise<AccountResponseDto> {
    return this.hederaService.getAccountById(accountId);
  }

  @Post('account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un compte (admin)' })
  @ApiOkResponse({ type: AccountResponseDto })
  async adminCreateAccount(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    try {
      return await this.hederaService.createAccount(dto);
    } catch (error) {
      this.handleError(error, 'Erreur admin - création de compte');
    }
  }

  @Get('accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les comptes' })
  @ApiOkResponse({ type: [AccountResponseDto] })
  async getAccounts(): Promise<AccountResponseDto[]> {
    return this.hederaService.getAllAccounts();
  }

  @Get('account/:accountId/balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir la balance HBAR' })
  @ApiOkResponse({ schema: { example: { balance: 1000000 } } })
  async getAccountBalance(@Param('accountId') accountId: string): Promise<{ balance: number }> {
    return this.hederaService.getAccountBalance(accountId);
  }

  @Get('account/:accountId/secure-balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir la balance sécurisée' })
  @ApiOkResponse({ schema: { example: { balance: 1000000 } } })
  async getSecureBalance(@Param('accountId') accountId: string, @Request() req: any) {
    return this.hederaService.getAccountBalanceWithAccessControl(accountId, req.user);
  }

  @Get('account/:accountId/balances')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir balances HBAR + tokens' })
  @ApiOkResponse({
    description: 'Solde complet',
    schema: {
      example: {
        hbar: 1000000,
        tokens: {
          '0.0.5678': 250,
          '0.0.9999': 5000,
        },
      },
    },
  })
  async getFullBalances(@Param('accountId') accountId: string, @Request() req: any) {
    return this.hederaService.getAccountBalancesFull(accountId, req.user);
  }
}
