// prisma.module.ts (exemple)
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';


@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- important !
})
export class PrismaModule {}
