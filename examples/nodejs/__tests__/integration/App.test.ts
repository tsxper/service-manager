import { App } from '../../app/App';
import { DownstreamService } from '../../app/services/DownstreamService';
import { VaultService } from '../../app/services/VaultService';
import { ServiceManagerType, buildServiceManager } from '../../app/sm';

class VaultFake extends VaultService {
  async getKey(key: string): Promise<string> {
    return 'test';
  }
}

class DownstreamFake extends DownstreamService {
  async send(data: Record<string, unknown>[]): Promise<void> {
  }
}

class TestApp extends App {
  protected sm?: ServiceManagerType;

  protected makeServiceManager() {
    const useGlobalCache = false;
    if (!this.sm) this.sm = buildServiceManager(useGlobalCache);
    return this.sm;
  }

  public getServiceManager() {
    return this.makeServiceManager().replace(
      'vault',
      () => new VaultFake('http://test/')
    ).replace(
      'downstream',
      async (sm) => {
        return new DownstreamFake(sm.get('logger'), sm.get('vault'), 'http://test/');
      }
    );
  }
}

describe('Examples NodeJS', () => {
  it('process data', async () => {
    const app = new TestApp();
    const sm = app.getServiceManager();
    const data = [{}, {}, {}];
    const logService = sm.get('logger');
    const mockLogFn = jest.spyOn(logService, 'log').mockImplementation(() => { });
    for (const entry of data) {
      await app.process([entry]);
    }
    const service = await sm.get('downstream');
    expect(service.getTotalProcessed()).toBe(data.length);
    expect(mockLogFn.mock.calls.length).toBe(data.length);
  });
});
