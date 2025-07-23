// account.module.ts
import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { PrismaModule } from '../database/prisma.module';  // chemin selon ton projet
import { HederaModule } from '../hedera/hedera.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [PrismaModule, HederaModule, TransactionModule],  // IMPORTS nécessaires
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
