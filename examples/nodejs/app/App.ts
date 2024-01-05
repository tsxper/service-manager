import { buildServiceManager } from './sm';

export class App {
  async process(records: Record<string, unknown>[]): Promise<void> {
    const sm = this.makeServiceManager();
    const downstream = await sm.get('downstream');
    await downstream.sendData(records);
  }

  protected makeServiceManager() {
    return buildServiceManager();
  }
}
