// auth.service.ts 

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.account.findUnique({ where: { username } });
    if (!user) return null;

    // comparer le mot de passe hashé
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    return user;
  }
}
