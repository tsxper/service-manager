import { sm } from './sm';

export class App {
  async process(records: Record<string, unknown>[]): Promise<void> {
    const downstream = await sm.get('downstream');
    await downstream.sendData(records);
  }
}
