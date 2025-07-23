import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './guards/jwt.strategy';
import { PrismaModule } from '../database/prisma.module'; 

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change_this_secret', // Utiliser une clé secrète sûre en prod
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
