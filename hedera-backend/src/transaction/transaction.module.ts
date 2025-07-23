// transaction.module.ts
import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PrismaService} from '../database/prisma.service'; // chemin à adapter

@Module({
 
  providers: [TransactionService, PrismaService],
  exports: [TransactionService], // si besoin d'exporter
})
export class TransactionModule {}

