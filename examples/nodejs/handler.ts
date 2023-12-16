import { App } from './app/App';

export const handler = async (records: Record<string, unknown>[]): Promise<void> => {
  const app = new App();
  app.process(records);
};
