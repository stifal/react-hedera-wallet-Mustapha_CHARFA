import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  TransferTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenAssociateTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  AccountInfoQuery,
  TransactionRecordQuery,
  NetworkVersionInfoQuery,
  TokenBurnTransaction,
  AccountBalanceQuery,
  FileCreateTransaction,
  AccountCreateTransaction,
  PublicKey,
} from '@hashgraph/sdk';

import * as dotenv from 'dotenv';
import { PrismaService } from '../database/prisma.service';
import { TransactionService } from '../transaction/transaction.service';



import {
  NetworkStatusDto,
  SendHbarDto,
  CreateTokenDto,
  AssociateTokenDto,
  SendTokenDto,
  CreateTopicDto,
  SendMessageDto,
  AccountInfoDto,
  CreateAccountDto,
  AccountResponseDto,

} from './dto';

import {AccountInfoResultDto} from './dto/account-info-result.dto'
import { JwtPayload } from '../auth/jwt-payload.interface';
import { retryWithBackoff } from '../utils/retry.util';




dotenv.config();

@Injectable()
export class HederaService {
  private readonly logger = new Logger(HederaService.name);
  private readonly client: Client;
  private readonly operatorId: AccountId;
  private readonly operatorKey: PrivateKey;

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {
    try {
      if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
        throw new Error('HEDERA_OPERATOR_ID et HEDERA_OPERATOR_KEY doivent être définis dans .env');
      }
      this.operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
      this.operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);
      this.client = Client.forName(process.env.HEDERA_NETWORK || 'testnet');
      this.client.setOperator(this.operatorId, this.operatorKey);
    } catch (err) {
      this.logger.error('Erreur lors de l\'initialisation du client Hedera', err);
      throw err;
    }
  }

  /**
   * Extract meaningful error message
   */
  private _getErrorMessage(error: unknown): string {
    if (error instanceof Error && 'status' in error) {
      return `Erreur Hedera : ${(error as any).status?.toString?.() ?? error.message}`;
    }
    if (error instanceof Error) {
      if ('status' in error && (error as any).status?.toString) {
        return `Erreur Hedera : ${(error as any).status.toString()}`;
      }
      return error.message;
    }
    return 'Erreur inconnue';
  }

  /**
   * Log transaction to DB, errors caught but not thrown to not block main flow
   */
  private async logTransaction(
    type: string,
    status: string,
    accountId: string,
    message?: string,
  ): Promise<void> {
    try {
      await this.prisma.logTransaction.create({
        data: { type, status, accountId, message },
      });
    } catch (err) {
      this.logger.error('Erreur lors du log transaction', err);
    }
  }

  /**
   * Simulate account creation
   */async createAccount(dto: CreateAccountDto): Promise<AccountResponseDto> {
    const { username, email, publicKey } = dto;

    this.logger.log(`Création de compte Hedera pour ${username}`);

    // Génération automatique de clés si non fournies
    let privateKeyObj: PrivateKey | null = null;
    let pubKeyHex: string;

    if (publicKey) {
      pubKeyHex = publicKey;
    } else {
      privateKeyObj = PrivateKey.generateED25519();
      pubKeyHex = privateKeyObj.publicKey.toStringRaw();
    }

    const accountId = `0.0.${Math.floor(Math.random() * 999999)}`;
    const createdAt = new Date().toISOString();

    return {
      status: 'success',
      accountId,
      username,
      publicKey: pubKeyHex,
      privateKey: privateKeyObj ? privateKeyObj.toStringRaw() : 'N/A',
      createdAt,
    };
  }
  
  /**
   * Get current Hedera network status (with retry)
   */
  async getNetworkStatus(): Promise<NetworkStatusDto> {
    try {
      const versionInfo = await retryWithBackoff(() =>
        new NetworkVersionInfoQuery().execute(this.client),
      );

      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        networkInfo: {
          servicesVersion: {
            major: versionInfo.servicesVersion?.major ?? 0,
            minor: versionInfo.servicesVersion?.minor ?? 0,
            patch: versionInfo.servicesVersion?.patch ?? 0,
          },
          protobufVersion: versionInfo.protobufVersion
            ? {
                major: versionInfo.protobufVersion.major ?? 0,
                minor: versionInfo.protobufVersion.minor ?? 0,
                patch: versionInfo.protobufVersion.patch ?? 0,
              }
            : undefined,
        },
      };
    } catch (error) {
      const message = this._getErrorMessage(error);
      this.logger.error('getNetworkStatus failed', error);
      throw new InternalServerErrorException(`Erreur statut Hedera: ${message}`);
    }
  }

  /**
   * Refresh network status wrapper
   */
  async refreshNetworkStatus(): Promise<NetworkStatusDto> {
    this.logger.log('Forçage du rafraîchissement du statut Hedera');
    return this.getNetworkStatus();
  }

  /**
   * Send HBAR from one account to another
   */
  
    async sendHbar(dto: SendHbarDto): Promise<any> {
  const { senderId, fromAccountId, toAccountId, amount } = dto;

  // Convertir amount en nombre
  const amountNum = Number(amount);

  this.logger.log(`Tentative d'envoi de ${amountNum} ℏ de ${senderId} vers ${toAccountId}`);

  if (
    !senderId ||
    !fromAccountId ||
    !toAccountId ||
    isNaN(amountNum) ||
    amountNum <= 0
  ) {
    throw new BadRequestException('Paramètres invalides pour sendHbar');
  }

  try {
    const senderAccountId = AccountId.fromString(senderId.trim());
    const recipientAccountId = AccountId.fromString(toAccountId.trim());
    const hbarAmount = new Hbar(amountNum);
    const senderKey = PrivateKey.fromString(fromAccountId.trim());

    const transaction = await new TransferTransaction()
      .addHbarTransfer(senderAccountId, hbarAmount.negated())
      .addHbarTransfer(recipientAccountId, hbarAmount)
      .freezeWith(this.client)
      .sign(senderKey);

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    const consensusTime = txResponse.transactionId?.validStart
      ? txResponse.transactionId.validStart.toDate().toISOString()
      : 'unknown';
    const transactionIdStr = txResponse.transactionId.toString();

    await this.transactionService.saveTransaction({
      senderId,
      recipientId: toAccountId,
      amount: BigInt(amountNum),
      txId: transactionIdStr,
      consensusTime,
    });

    this.logger.log(`✅ Transaction confirmée : ${transactionIdStr}`);

    return {
      success: true,
      message: 'Transaction HBAR effectuée avec succès',
      data: {
        transactionId: transactionIdStr,
        amount: amountNum,
        amountFormatted: `${amountNum} ℏ`,
        senderId: senderId.trim(),
        receiverId: toAccountId.trim(),
        consensusTime,
        status: receipt.status.toString(),
      },
    };
  } catch (error) {
    const message = this._getErrorMessage(error);
    this.logger.error(`❌ Échec de l'envoi HBAR : ${message}`, error);
    throw new InternalServerErrorException(message);
  }
}


  /**
   * Get balance in tinybars (number)
   */
  async getBalance(accountId: string): Promise<number> {
    if (!accountId) throw new BadRequestException('accountId est requis');
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client);

      const hbarTinybars = balance.hbars.toTinybars().toNumber();
      this.logger.log(`Solde du compte ${accountId} : ${hbarTinybars} tinybars`);
      return hbarTinybars;
    } catch (error) {
      const message = this._getErrorMessage(error);
      this.logger.error(`Erreur lors de la récupération du solde : ${message}`, error);
      throw new InternalServerErrorException('Erreur lors de la récupération du solde');
    }
  }

  /**
   * Get account info (balance + tokens)
   */async getAccountInfo(dto: AccountInfoDto): Promise<AccountInfoResultDto> {
  if (!dto.accountId) {
    throw new BadRequestException('AccountId est requis');
  }

  try {
    const accountId = AccountId.fromString(dto.accountId);
    const info = await new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(this.client);

    // Si aucune info retournée (exemple : account inexistant ou supprimé)
    if (!info) {
      await this.logTransaction('account_info', 'FAILED', dto.accountId, 'Compte non trouvé');
      throw new NotFoundException(`Compte ${dto.accountId} non trouvé`);
    }

    const tokens: string[] = [];
    if (info.tokenRelationships && typeof info.tokenRelationships._map === 'object') {
      for (const [, tokenRel] of Object.entries(info.tokenRelationships._map)) {
        if (tokenRel.tokenId) {
          tokens.push(tokenRel.tokenId.toString());
        }
      }
    }

    await this.logTransaction('account_info', 'SUCCESS', dto.accountId);

    return {
      accountId: info.accountId.toString(),
      balance: info.balance.toString(),
      tokens,
    };
  } catch (error: any) {
    const accountId = dto.accountId ?? 'unknown';
    const message = error?.message ?? 'Erreur inconnue';

    await this.logTransaction('account_info', 'FAILED', accountId, message);
    this.logger.error(`getAccountInfo failed for accountId=${accountId}`, error);

    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error; // remonter ces erreurs spécifiques
    }
    
    throw new InternalServerErrorException(message);
  }
}


  /**
   * Create fungible token
   */
  async createToken(dto: CreateTokenDto): Promise<{ tokenId: string | null; status: string }> {
    if (!dto.name || !dto.symbol || dto.initialSupply == null) {
      throw new BadRequestException('Données de création de token incomplètes');
    }

    try {
      const tx = await new TokenCreateTransaction()
        .setTokenName(dto.name)
        .setTokenSymbol(dto.symbol)
        .setDecimals(dto.decimals ?? 0)
        .setInitialSupply(dto.initialSupply)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(this.operatorKey.publicKey)
        .freezeWith(this.client)
        .sign(this.operatorKey);

      const response = await tx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const status = receipt.status.toString();
      const tokenId = receipt.tokenId?.toString() ?? null;

      await this.logTransaction('token_create', status, this.operatorId.toString(), `Token ${tokenId} créé`);

      return { tokenId, status };
    } catch (error: any) {
      const message = error?.message ?? 'Erreur lors de la création du token';
      await this.logTransaction('token_create', 'FAILED', this.operatorId.toString(), message);
      this.logger.error('createToken failed', error);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Associate token to account
   */
  async associateToken(dto: AssociateTokenDto): Promise<{ status: string }> {
    if (!dto.accountId || !dto.tokenId || !dto.privateKey) {
      throw new BadRequestException("Données d'association token invalides");
    }

    try {
      const accountId = AccountId.fromString(dto.accountId);
      const accountKey = PrivateKey.fromString(dto.privateKey);

      const tx = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([dto.tokenId])
        .freezeWith(this.client)
        .sign(accountKey);

      const response = await tx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const status = receipt.status.toString();

      await this.logTransaction('token_associate', status, dto.accountId, `Token ${dto.tokenId} associé`);
      return { status }; 
      
    } catch (error: any) {
      const message = error?.message ?? "Erreur lors de l'association du token";
      await this.logTransaction('token_associate', 'FAILED', dto.accountId ?? 'unknown', message);
      this.logger.error('associateToken failed', error);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Send token from account to another
   */
  async sendToken(dto: SendTokenDto): Promise<{ status: string; transactionId: string }> {
    if (!dto.accountId || !dto.receiverId || !dto.tokenId || !dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Données d’envoi token invalides');
    }

    try {
      const senderId = AccountId.fromString(dto.accountId);
      const receiverId = AccountId.fromString(dto.receiverId);

      const tx = await new TransferTransaction()
        .addTokenTransfer(dto.tokenId, senderId, -dto.amount)
        .addTokenTransfer(dto.tokenId, receiverId, dto.amount)
        .execute(this.client);

      const receipt = await tx.getReceipt(this.client);
      const status = receipt.status.toString();

      await this.logTransaction('token_transfer', status, dto.accountId, `Envoyé ${dto.amount} token ${dto.tokenId} à ${dto.receiverId}`);
      
      return { status, transactionId: tx.transactionId.toString() };
    } catch (error: any) {
      const message = error?.message ?? 'Erreur lors du transfert du token';
      await this.logTransaction('token_transfer', 'FAILED', dto.accountId ?? 'unknown', message);
      this.logger.error('sendToken failed', error);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Create consensus topic
   */
  async createTopic(dto: CreateTopicDto): Promise<{ topicId: string | null; status: string }> {
    try {
      const tx = await new TopicCreateTransaction()
        .setTopicMemo(dto.memo || 'Hedera Topic')
        .execute(this.client);

      const receipt = await tx.getReceipt(this.client);
      const status = receipt.status.toString();
      const topicId = receipt.topicId?.toString() ?? null;

      await this.logTransaction('topic_create', status, this.operatorId.toString(), `Topic ${topicId} créé`);
        return { topicId, status };
    } catch (error: any) {
      const message = error?.message ?? "Erreur lors de la création du topic";
      await this.logTransaction('topic_create', 'FAILED', this.operatorId.toString(), message);
      this.logger.error('createTopic failed', error);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Send message to topic
   */
  async sendMessage(dto: SendMessageDto): Promise<{ status: string; consensusTimestamp: Date }> {
    if (!dto.topicId || !dto.message) {
      throw new BadRequestException('Données de message invalides');
    }

    try {
      const tx = await new TopicMessageSubmitTransaction()
        .setTopicId(dto.topicId)
        .setMessage(dto.message)
        .execute(this.client);

      const record = await new TransactionRecordQuery()
        .setTransactionId(tx.transactionId)
        .execute(this.client);

      const status = record.receipt.status.toString();
      const consensusTimestamp = record.consensusTimestamp.toDate();

      await this.logTransaction('topic_message_send', status, this.operatorId.toString(), `Message envoyé au topic ${dto.topicId}`);
         return { status, consensusTimestamp };
    } catch (error: any) {
      const message = error?.message ?? "Erreur lors de l'envoi du message";
      await this.logTransaction('topic_message_send', 'FAILED', this.operatorId.toString(), message);
      this.logger.error('sendMessage failed', error);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Access control check
   */
  private hasAccessOrThrow(accountId: string, user: JwtPayload): void {
    const isAdmin = user.roles.includes('admin');
    const isOwner = user.accountId === accountId;
    
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Accès refusé : Ce compte ne vous appartient pas.');
    }
  }

  /**
   * Get account balance with access control
   */
  async getAccountBalanceWithAccessControl(
    requestedAccountId: string,
    user: JwtPayload,
  ): Promise<{ balance: number }> {
    this.hasAccessOrThrow(requestedAccountId, user);

    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(requestedAccountId)
        .execute(this.client);

      return { balance: Number(balance.hbars.toTinybars()) / 1e8 };
    } catch (error: any) {
      const message = error?.message ?? "Erreur lors de la récupération de la balance";
      this.logger.error('getAccountBalanceWithAccessControl failed', error);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Get full balances (HBAR + tokens) with access control
   */
  async getAccountBalancesFull(
    requestedAccountId: string,
    user: JwtPayload,
  ): Promise<{ hbar: number; tokens: Record<string, number> }> {
    this.hasAccessOrThrow(requestedAccountId, user);

    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(requestedAccountId)
        .execute(this.client);

      const tokens: Record<string, number> = {};
      
      if (balance.tokens) {
        for (const [tokenId, amount] of balance.tokens) {
          tokens[tokenId.toString()] = Number(amount);
        }
      }

      return { hbar: Number(balance.hbars.toTinybars()) / 1e8, tokens };
    } catch (error: any) {
      const message = error?.message ?? "Erreur lors de la récupération des balances complètes";
      this.logger.error('getAccountBalancesFull failed', error);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Get account balance without access control
   */
  async getAccountBalance(accountId: string): Promise<{ balance: number }> {
    if (!accountId) throw new BadRequestException('accountId est requis');
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(this.client);

      return { balance: Number(balance.hbars.toTinybars()) / 1e8 };
    } catch (error: any) {
      const message = error?.message ?? `Erreur lors de la récupération de la balance Hedera : ${error.message}`;
      this.logger.error('getAccountBalance failed', error);
      throw new InternalServerErrorException(message);
    }
  }
async getAccountById(accountId: string): Promise<AccountResponseDto> {
  const account = await this.prisma.account.findUnique({ where: { accountId } });

  if (!account) {
    throw new NotFoundException(`Aucun compte trouvé avec l'ID ${accountId}`);
  }

  return {
    accountId: account.accountId,
    publicKey: account.publicKey,
    createdAt: account.createdAt.toISOString(),
    username: account.username,
    initialBalance: '0',   // Valeur par défaut si non stockée
    status: 'success',     // Par défaut ou autre logique métier
    privateKey: account.privateKey,
  };
}
  /**
   * Get all accounts stored in database
   */
 async getAllAccounts(): Promise<AccountResponseDto[]> {
  const accounts = await this.prisma.account.findMany();

  return accounts.map(account => ({
    accountId: account.accountId,
    publicKey: account.publicKey,
    createdAt: account.createdAt.toISOString(),
    username: account.username,
    initialBalance: account.initialBalance ?? '0',
    status: 'success',
    privateKey: account.privateKey,
  }));
}

  /**
   * Burn tokens with retry
   */
  async burnToken(tokenId: string, amount: number): Promise<{ status: string }> {
    if (!tokenId || amount <= 0) {
      throw new BadRequestException('tokenId et amount valides requis');
    }
    try {
      await retryWithBackoff(() =>
        new TokenBurnTransaction()
          .setTokenId(tokenId)
          .setAmount(amount)
          .execute(this.client),
      );
      return { status: 'Token burned successfully' };
    } catch (error) {
      const message = this._getErrorMessage(error);
      this.logger.error('Erreur burnToken', error);
      throw new InternalServerErrorException(message);
    }
  }

  /**
   * Create a file on Hedera with retry
   */
  async createFile(contents: Buffer): Promise<{ fileId: string }> {
    if (!contents || contents.length === 0) {
      throw new BadRequestException('Contenu du fichier requis');
    }
    try {
      const tx = await retryWithBackoff(() =>
        new FileCreateTransaction()
          .setKeys([this.operatorKey.publicKey])
          .setContents(contents)
          .execute(this.client),
      );
      const receipt = await tx.getReceipt(this.client);
      return { fileId: receipt.fileId!.toString() };
    } catch (error) {
      const message = this._getErrorMessage(error);
      this.logger.error('Erreur createFile', error);
      throw new InternalServerErrorException(message);
    }
  }
}
