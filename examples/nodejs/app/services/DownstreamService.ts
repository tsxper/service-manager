import axios from 'axios';
import { LoggerService } from './LoggerService';
import { VaultService } from './VaultService';

export class DownstreamService {
  protected url: string;
  protected logger: LoggerService;
  protected vault: VaultService;
  protected totalProcessed = 0;
  protected token?: string;

  constructor(logger: LoggerService, vault: VaultService, url: string) {
    this.logger = logger;
    this.vault = vault;
    this.url = url;
  }

  async sendData(data: Record<string, unknown>[]): Promise<void> {
    await this.send(data);
    this.logger.log(`Sent ${data.length} records to downstream.`);
    this.totalProcessed += data.length;
  }

  getTotalProcessed(): number {
    return this.totalProcessed;
  }

  protected async getToken(): Promise<string> {
    if (!this.token) {
      this.token = await this.vault.getKey('token');
    }
    return this.token;
  }

  protected async send(data: Record<string, unknown>[]): Promise<void> {
    await axios.post(
      this.url,
      { data },
      {
        headers: {
          Authorization: "Bearer " + await this.getToken(),
        }
      }
    );
  }
}
