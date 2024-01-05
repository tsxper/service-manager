// import { ServiceManager } from '@tsxper/service-manager';
import { ServiceManager } from '../../../src';
import { LoggerService } from './services/LoggerService';
import { VaultService } from './services/VaultService';
import { DownstreamService } from './services/DownstreamService';

export const buildServiceManager = (global = true) => new ServiceManager({
  'logger': () => new LoggerService(),
  'vault': () => {
    const url = process.env.VAULT_URL;
    if (!url) throw new Error('VAULT_URL is not set');
    return new VaultService(url);
  },
}, global).add('downstream', async (sm) => {
  const vault = sm.get('vault');
  const url = await vault.getKey('DOWNSTREAM_URL');
  return new DownstreamService(sm.get('logger'), vault, url);
});

export type ServiceManagerType = ReturnType<typeof buildServiceManager>;
