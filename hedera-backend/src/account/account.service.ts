//account-service
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { HederaService } from '../hedera/hedera.service';
import { PrismaService } from '../database/prisma.service';
import { TransactionService } from '../transaction/transaction.service';

import { CreateAccountDto } from '../hedera/dto/create-account.dto';
import { AccountInfoDto } from '../hedera/dto/account-info.dto';

@Injectable()
export class AccountService {
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hederaService: HederaService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Crée un compte Hedera en base et sur le réseau Hedera avec hash sécurisé du mot de passe.
   */
  async createAccount(
    dto: CreateAccountDto,
  ): Promise<{ message: string; account: AccountInfoDto }> {
    if (!dto.username || !dto.password || !dto.publicKey) {
      throw new BadRequestException(
        'Username, password and publicKey are required',
      );
    }

    let hederaResult;
    try {
      hederaResult = await this.hederaService.createAccount(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur création compte Hedera: ${(error as Error).message}`,
      );
    }

    if (!hederaResult?.privateKey || !hederaResult?.accountId) {
      throw new InternalServerErrorException(
        'Le service Hedera n’a pas retourné les clés du compte',
      );
    }

    // Hash du mot de passe avant stockage en base
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors du hash du mot de passe: ${(error as Error).message}`,
      );
    }

    let createdAccount;
    try {
      createdAccount = await this.prisma.account.create({
        data: {
          accountId: hederaResult.accountId ?? uuidv4(),
          email: dto.email ?? '',
          username: dto.username,
          password: hashedPassword, // stocké hashé
          privateKey: hederaResult.privateKey,
          publicKey: dto.publicKey,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur création compte en base : ${(error as Error).message}`,
      );
    }

    // Retourne sans exposer privateKey
    const accountInfo: AccountInfoDto = {
      accountId: createdAccount.accountId,
      username: createdAccount.username,
      email: createdAccount.email ?? '',
      publicKey: createdAccount.publicKey,
      balance: 0,
      createdAt: createdAccount.createdAt, // Date conforme au DTO
    };

    return {
      message: 'Account created',
      account: accountInfo,
    };
  }

  /**
   * Récupère les informations d’un compte avec les soldes à jour depuis Hedera.
   * @param userId AccountId du compte.
   * @param includePrivateKey Optionnel, pour inclure la clé privée (ex: admin/debug).
   */
  async getAccountInfo(
    userId: string,
    includePrivateKey = false,
  ): Promise<AccountInfoDto> {
    const account = await this.prisma.account.findUnique({
      where: { accountId: userId },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${userId} not found`);
    }

    let hederaInfo;
    try {
      hederaInfo = await this.hederaService.getAccountInfo({
        accountId: account.accountId,
        privateKey: account.privateKey,
      } as AccountInfoDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur récupération infos Hedera: ${(error as Error).message}`,
      );
    }

    return {
      accountId: account.accountId,
      username: account.username,
      email: account.email ?? '',
      publicKey: account.publicKey,
      ...(includePrivateKey ? { privateKey: account.privateKey } : {}),
      balance:
        typeof hederaInfo.balance === 'string'
          ? parseFloat(hederaInfo.balance)
          : hederaInfo.balance,
      createdAt: account.createdAt,
    };
  }
}
