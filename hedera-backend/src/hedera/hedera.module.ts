import { Module } from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service'; // selon où il est défini
import { PrismaModule } from '../database/prisma.module'; 
import { HederaService } from './hedera.service';


@Module({
  imports: [PrismaModule], // <-- Import du module qui fournit PrismaService
  providers: [HederaService, TransactionService],
  exports: [HederaService],
})
export class HederaModule {}
