import { kmsClient } from '../config/kms';

export class EncryptionService {
  async encryptData(data: string, keyId: string): Promise<string> {
    return await kmsClient.encryptData(data, keyId);
  }

  async decryptData(encryptedData: string, keyId: string): Promise<string> {
    return await kmsClient.decryptData(encryptedData, keyId);
  }
}
