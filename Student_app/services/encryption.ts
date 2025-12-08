import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

/**
 * Encryption service for face images
 */
class EncryptionService {
  /**
   * Encrypt image data using AES encryption
   * @param imageBase64 - Base64 encoded image string
   * @param encryptionKey - Encryption key from the server
   * @returns Encrypted image data as base64 string
   */
  encryptImage(imageBase64: string, encryptionKey: string): string {
    try {
      console.log('Encrypting image with key length:', encryptionKey?.length);
      
      if (!imageBase64) {
        throw new Error('Image data is empty');
      }
      
      if (!encryptionKey) {
        throw new Error('Encryption key is empty');
      }

      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      // Parse key (expecting hex string from backend)
      const key = CryptoJS.enc.Hex.parse(encryptionKey);
      
      // Generate random IV (16 bytes)
      const iv = CryptoJS.lib.WordArray.random(16);

      // Encrypt the image data using AES-CBC
      const encrypted = CryptoJS.AES.encrypt(cleanBase64, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Combine IV and Ciphertext
      // encrypted.ciphertext is the ciphertext WordArray
      const combined = iv.clone().concat(encrypted.ciphertext);

      // Return as base64 string
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Encryption error details:', error);
      // @ts-ignore
      if (error.message) console.error('Error message:', error.message);
      throw new Error('Failed to encrypt image data: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Decrypt image data using AES decryption
   * @param encryptedData - Encrypted data string
   * @param encryptionKey - Encryption key from the server
   * @returns Decrypted image data as base64 string
   */
  decryptImage(encryptedData: string, encryptionKey: string): string {
    try {
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);

      // Convert to string
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      return decryptedString;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt image data');
    }
  }

  /**
   * Generate a hash of the image for verification
   * @param imageBase64 - Base64 encoded image string
   * @returns SHA256 hash of the image
   */
  generateImageHash(imageBase64: string): string {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      return CryptoJS.SHA256(cleanBase64).toString();
    } catch (error) {
      console.error('Hash generation error:', error);
      throw new Error('Failed to generate image hash');
    }
  }

  /**
   * Complete encryption workflow with metadata
   * @param imageBase64 - Base64 encoded image string
   * @param encryptionKey - Encryption key from server
   * @returns Object with encrypted data and metadata
   */
  encryptFaceDataWithMetadata(
    imageBase64: string,
    encryptionKey: string,
    metadata?: { timestamp?: string; userId?: string }
  ): string {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageHash = this.generateImageHash(cleanBase64);

      // Create payload with metadata
      const payload = {
        image: cleanBase64,
        hash: imageHash,
        metadata: {
          timestamp: metadata?.timestamp || new Date().toISOString(),
          userId: metadata?.userId || 'anonymous',
        },
      };

      // Encrypt the entire payload
      console.log('Encrypting payload with key length:', encryptionKey?.length);
      const payloadString = JSON.stringify(payload);
      
      // Parse key (expecting hex string from backend)
      const key = CryptoJS.enc.Hex.parse(encryptionKey);
      
      // Generate random IV (16 bytes)
      const iv = CryptoJS.lib.WordArray.random(16);

      const encrypted = CryptoJS.AES.encrypt(payloadString, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Combine IV and Ciphertext
      const combined = iv.clone().concat(encrypted.ciphertext);

      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Payload encryption error details:', error);
      throw new Error('Failed to encrypt face data with metadata: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}

export default new EncryptionService();
