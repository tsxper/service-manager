import { App } from '../../app/App';
import { DownstreamService } from '../../app/services/DownstreamService';
import { VaultService } from '../../app/services/VaultService';
import { sm } from '../../app/sm';

class VaultFake extends VaultService {
  async getKey(key: string): Promise<string> {
    return 'test';
  }
}

class DownstreamFake extends DownstreamService {
  async send(data: Record<string, unknown>[]): Promise<void> {
  }
}

describe('Examples NodeJS', () => {
  sm.replace(
    'vault',
    () => new VaultFake('http://test/')
  ).replace(
    'downstream',
    async () => {
      return new DownstreamFake(sm.get('logger'), sm.get('vault'), 'http://test/');
    }
  );

  it('process data', async () => {
    const data = [{}, {}, {}];
    const logService = sm.get('logger');
    const mockLogFn = jest.spyOn(logService, 'log').mockImplementation(() => { });
    const app = new App();
    for (const entry of data) {
      await app.process([entry]);
    }
    const service = await sm.get('downstream');
    expect(service.getTotalProcessed()).toBe(data.length);
    expect(mockLogFn.mock.calls.length).toBe(data.length);
  });
});
