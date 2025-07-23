import {
  Controller,
  Get,
  Request,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountService } from './account.service';
import { PrismaService } from '../database/prisma.service';


import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AccountInfoDto } from '../hedera/dto/account-info.dto';

@ApiTags('Account')
@ApiBearerAuth() // active l'icône de lock dans Swagger pour ce controller
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService, private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('info')
  @ApiOperation({ summary: 'Récupérer les informations du compte connecté' })
  @ApiOkResponse({
    description: 'Informations du compte Hedera',
    type: AccountInfoDto,
  })
  async getAccountInfo(@Request() req: any): Promise<AccountInfoDto> {
    try {
      const user = req.user;
      if (!user || !user.accountId) {
        throw new InternalServerErrorException('Utilisateur non valide ou JWT incomplet');
      }

      return await this.accountService.getAccountInfo(user.accountId);
    } catch (error) {
      const err = error as Error;
      throw new InternalServerErrorException(err.message || 'Erreur serveur');
    }
  }
}
