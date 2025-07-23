import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { NetworkStatusDto } from './dto/network-status.dto';
import { VersionInfoDto } from './dto/version-info.dto';
import { NetworkInfoDto } from './dto/network-info.dto';
import { Client, NetworkVersionInfoQuery, SemanticVersion, AccountId, PrivateKey } from '@hashgraph/sdk';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  private cachedStatus: NetworkStatusDto | null = null;

  private client: Client;

  constructor(private readonly configService: ConfigService) {
    // Lecture des variables d'environnement
    const operatorIdStr = this.configService.get<string>('HEDERA_OPERATOR_ID');
    const operatorKeyStr = this.configService.get<string>('HEDERA_OPERATOR_KEY');
    const network = this.configService.get<string>('HEDERA_NETWORK') || 'testnet';

    if (!operatorIdStr || !operatorKeyStr) {
      throw new Error('HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set in environment variables');
    }

    // Création du client Hedera configuré
    this.client = Client.forName(network); // 'testnet' ou 'mainnet' selon ta config

    this.client.setOperator(
      AccountId.fromString(operatorIdStr),
      PrivateKey.fromString(operatorKeyStr)
    );

    this.refreshStatus(); // Initial fetch on startup
  }

  getStatus(): NetworkStatusDto | null {
    return this.cachedStatus;
  }

  @Cron('*/5 * * * *') // Every 5 minutes
  async refreshStatus() {
    try {
      this.logger.log('Refreshing Hedera network status...');

      const versionInfo = await new NetworkVersionInfoQuery().execute(this.client);

      const servicesVersion = this.toVersionInfoDto(versionInfo.servicesVersion);
      const protobufVersion = this.toVersionInfoDto(versionInfo.protobufVersion);

      const networkInfo = new NetworkInfoDto(servicesVersion, protobufVersion);

      this.cachedStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        networkInfo,
      };

      this.logger.log('Network status refreshed successfully');
    } catch (error) {
      this.logger.error('Failed to refresh network status', error);
    }
  }

  private toVersionInfoDto(version: SemanticVersion): VersionInfoDto {
    return new VersionInfoDto(version.major, version.minor, version.patch);
  }
}
