import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { v4 as uuidv4 } from 'uuid'; // ✅ Pour générer des UUIDs

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enregistre une transaction, avec génération automatique de transactionId
   */
  async saveTransaction(data: {
    senderId: string;
    recipientId: string;
    amount: bigint;
    txId: string;
    consensusTime: string;
  }) {
    try {
      return await this.prisma.transactionRecord.create({
        data: {
          transactionId: uuidv4(), // ✅ requis par Prisma
          ...data,
        },
      });
    } catch (error) {
      this.logger.error(
        'Erreur lors de saveTransaction',
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error instanceof Error ? error : new Error('Erreur inconnue');
    }
  }

  /**
   * Enregistre une transaction avec un transactionId fourni
   */
  async logTransfer(data: {
    transactionId: string;
    senderId: string;
    recipientId: string;
    amount: bigint;
    txId: string;
    consensusTime: string;
  }) {
    try {
      return await this.prisma.transactionRecord.create({
        data,
      });
    } catch (error) {
      this.logger.error(
        'Erreur lors de l\'enregistrement de la transaction',
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error instanceof Error ? error : new Error('Erreur inconnue');
    }
  }
}
