// import axios from 'axios';

export class VaultService {
  protected url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getKey(key: string): Promise<string> {
    // const res = await axios.get(this.url, { params: { key } }) as string;
    // if (!res) {
    //   throw new Error(`Empty response for key ${key}`);
    // }
    return '';
  }
}
