import faceUploadService from '@/services/faceUploadService';
import { useCallback, useState } from 'react';

interface UseFaceUploadOptions {
  onSuccess?: (jobId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to handle face capture and encryption workflow
 */
export function useFaceUpload(options?: UseFaceUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const uploadFace = useCallback(
    async (faceBase64: string) => {
      setIsUploading(true);
      setUploadError(null);

      try {
        console.log('[FaceUpload Hook] Starting face upload process...');

        // Call the face upload service
        const result = await faceUploadService.handleFaceCaptureEncryption(faceBase64);

        setJobId(result.jobId);
        console.log('[FaceUpload Hook] Face upload successful. Job ID:', result.jobId);

        if (options?.onSuccess) {
          options.onSuccess(result.jobId);
        }

        return result;
      } catch (error: any) {
        console.error('[FaceUpload Hook] Face upload failed:', error);

        const errorObj = error instanceof Error ? error : new Error(String(error));
        setUploadError(errorObj);

        if (options?.onError) {
          options.onError(errorObj);
        }

        throw errorObj;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const resetState = useCallback(() => {
    setIsUploading(false);
    setUploadError(null);
    setJobId(null);
  }, []);

  return {
    uploadFace,
    isUploading,
    uploadError,
    jobId,
    resetState,
  };
}
