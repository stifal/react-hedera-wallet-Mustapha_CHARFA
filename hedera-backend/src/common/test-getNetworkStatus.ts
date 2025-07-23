class NetworkStatusDto {
  status: string = '';
  network: string = '';
}

class HederaService {
  async getNetworkStatus(): Promise<NetworkStatusDto> {
    return { status: 'OK', network: 'testnet' };
  }
}

class HederaController {
  private hederaService = new HederaService();

  async getNetworkStatus(): Promise<NetworkStatusDto> {
    return await this.hederaService.getNetworkStatus();
  }
}

async function runTest() {
  const c = new HederaController();
  const res = await c.getNetworkStatus();
  console.log(res);
}

runTest();
