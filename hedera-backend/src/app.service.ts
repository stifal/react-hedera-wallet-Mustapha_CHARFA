import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Retourne un message de santé de l'API.
   */
  getHealthStatus(): { status: string; message: string } {
    return {
      status: 'OK',
      message: 'API is up and running ✅',
    };
  }
}
