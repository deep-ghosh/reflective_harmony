import speakeasy from 'speakeasy';

export class TwoFAService {
  generateSecret(name: string): { secret: string; qrCode: string } {
    const secret = speakeasy.generateSecret({ name });
    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || ''
    };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
  }
}
