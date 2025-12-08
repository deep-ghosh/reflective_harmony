import * as SecureStore from 'expo-secure-store';
import apiService from './api';
import encryptionService from './encryption';

/**
 * Face Upload Service
 * Handles complete workflow: Get encryption key -> Encrypt face -> Submit data
 */
class FaceUploadService {
  /**
   * Complete face capture and encryption workflow
   * @param faceBase64 - Face image in base64 format
   * @returns Promise with jobId from server
   */
  async handleFaceCaptureEncryption(faceBase64: string): Promise<{ jobId: string }> {
    try {
      // Step 1: Get access token from secure storage
      const tokens = await apiService.getStoredAuthTokens();
      if (!tokens?.accessToken) {
        throw new Error('No access token found. Please login first.');
      }

      // Step 2: Get encryption key from server (POST /encryption)
      console.log('[FaceUpload] Fetching encryption key from server...');
      const encryptionKey = await apiService.getEncryptionKey(tokens.accessToken);
      console.log('[FaceUpload] Encryption key received');

      // Step 3: Get user ID for metadata
      const userId = await SecureStore.getItemAsync('userId');

      // Step 4: Encrypt face data with metadata
      console.log('[FaceUpload] Encrypting face data...');
      const encryptedData = encryptionService.encryptFaceDataWithMetadata(
        faceBase64,
        encryptionKey,
        {
          timestamp: new Date().toISOString(),
          userId: userId || 'anonymous',
        }
      );
      console.log('[FaceUpload] Face data encrypted');

      // Step 5: Submit encrypted data to server (POST /api/submit)
      console.log('[FaceUpload] Submitting encrypted data to server...');
      const response = await apiService.submitEncryptedFaceData(
        encryptedData,
        tokens.accessToken
      );
      console.log('[FaceUpload] Data submitted successfully', response);

      return {
        jobId: response.jobId || response.job_id || 'mock_job_id',
      };
    } catch (error: any) {
      console.error('[FaceUpload] Error in face upload workflow:', error);
      throw new Error(
        error.message || 'Failed to process and submit face capture'
      );
    }
  }

  /**
   * Alternative: Direct encryption without server key (for offline mode)
   * @param faceBase64 - Face image in base64 format
   * @param localKey - Local encryption key
   * @returns Encrypted face data
   */
  encryptFaceLocally(faceBase64: string, localKey: string = 'local_key_123'): string {
    try {
      const encryptedData = encryptionService.encryptFaceDataWithMetadata(
        faceBase64,
        localKey
      );
      return encryptedData;
    } catch (error: any) {
      throw new Error('Failed to encrypt face data locally: ' + error.message);
    }
  }

  /**
   * Generate face data hash for integrity verification
   * @param faceBase64 - Face image in base64 format
   * @returns SHA256 hash of the face data
   */
  generateFaceHash(faceBase64: string): string {
    try {
      return encryptionService.generateImageHash(faceBase64);
    } catch (error: any) {
      throw new Error('Failed to generate face hash: ' + error.message);
    }
  }
}

export default new FaceUploadService();
