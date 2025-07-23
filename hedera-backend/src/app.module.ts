import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import {HederaModule} from './hedera/hedera.module'

@Module({

  imports: [
      AuthModule, AccountModule, HederaModule,
      /*, autres modules*/
    ],
})
export class AppModule {}
