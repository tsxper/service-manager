import { ServiceManager } from '../ServiceManager';

describe('AppServices', () => {
  class Vault {
    async getPassword(): Promise<string> {
      // request to credentials service
      return 'password';
    }
  }
  class RemoteAPI {
    constructor(protected vault: Vault) { }

    async getToken(): Promise<string> {
      const pwd = await this.vault.getPassword();
      // request to get API token
      const token = `token#${pwd}`;
      return token;
    }
  }

  const setupServices = () => new ServiceManager({
      'vault': () => new Vault(),
    }).add(
      'api',
      (sm) => new RemoteAPI(sm.get('vault'))
    );

  it('setup app services', async () => {
    const sm = setupServices();
    const x = sm.get('api');
    const token = await x.getToken();
    expect(token).toBe('token#password');
  });

  it('test services', async () => {
    const sm = setupServices();
    const vaultService = sm.get('vault');
    jest.spyOn(vaultService, 'getPassword').mockImplementation(async () => 'test');
    const apiService = sm.get('api');
    const token = await apiService.getToken();
    expect(token).toBe('token#test');
  });
});
