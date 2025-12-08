import { API_CONFIG } from "@/config/api.config";
import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

export interface LoginCredentials {
  userId: string;
  userPass: string;
}

export interface User {
  uuid: string;
  userId: string;
  email: string | null;
}

export interface AuthResponse {
  message?: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface FaceUploadPayload {
  faceImage: string; // Base64 encoded encrypted face image
  accessToken: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor: Attach Token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle Refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync("refreshToken");
            
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            console.log("Attempting to refresh token...");
            
            // Call backend refresh endpoint
            // NOTE: We use axios directly to avoid interceptors on this call
            const refreshResponse = await axios.post(
              `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`,
              { refreshToken },
              {
                headers: { "Content-Type": "application/json" },
                timeout: API_CONFIG.TIMEOUT
              }
            );

            const { accessToken } = refreshResponse.data;

            if (accessToken) {
              console.log("Token refresh successful");
              
              // Store new access token
              await SecureStore.setItemAsync("accessToken", accessToken);
              
              // Update authorization header and retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // Logout if refresh fails
            await this.clearAuthTokens();
            // TODO: Ideally redirect to login, but we can't access router here easily. 
            // The UI will detect the missing token on next check.
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login with student credentials (Bypass mode - accepts any credentials)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );

      const authData = response.data;

      // Store tokens securely
      await this.storeAuthTokens(authData);
      console.log("Login successful");

      return authData;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.error || "Login failed. Please try again.");
    }
  }

  /**
   * Get encryption key from server
   * POST /encryption (Authorization: Bearer <token>) -> 200 {encryptionKey}
   */
  async getEncryptionKey(accessToken: string): Promise<string> {
    try {
      const response = await this.axiosInstance.post(
        '/encryption',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log('Received encryption key from server:', response.data.encryptionKey ? 'Present' : 'Missing');
      return response.data.encryptionKey;
    } catch (error: any) {
      console.error('Failed to get encryption key:', error);
      // Fallback: return a default key for demo purposes
      return 'default_encryption_key_12345';
    }
  }

  /**
   * Submit encrypted face image data
   * POST /api/submit (Authorization: Bearer <token>) {encryptedData} -> 202 {jobId}
   */
  async submitEncryptedFaceData(
    encryptedImage: string,
    accessToken: string
  ): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        '/api/submit',
        {
          encryptedData: encryptedImage,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data; // Should return { jobId: string }
    } catch (error: any) {
      console.error('Face data submission error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to submit face data.'
      );
    }
  }

  /**
   * Upload encrypted face image (legacy method)
   */
  async uploadFaceImage(
    encryptedImage: string,
    accessToken: string
  ): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        API_CONFIG.ENDPOINTS.FACE_UPLOAD,
        {
          faceImage: encryptedImage,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Face upload error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to upload face image."
      );
    }
  }

  /**
   * Store authentication tokens securely
   */
  private async storeAuthTokens(authData: AuthResponse): Promise<void> {
    try {
      if (authData.accessToken) await SecureStore.setItemAsync("accessToken", String(authData.accessToken));
      if (authData.refreshToken) await SecureStore.setItemAsync("refreshToken", String(authData.refreshToken));
      if (authData.user.userId) await SecureStore.setItemAsync("userId", String(authData.user.userId));
      if (authData.user.uuid) await SecureStore.setItemAsync("userUuid", String(authData.user.uuid));
      if (authData.user.email) await SecureStore.setItemAsync("userEmail", String(authData.user.email));
    } catch (error) {
      console.error("Error storing auth tokens:", error);
      throw new Error("Failed to store authentication tokens securely.");
    }
  }

  /**
   * Retrieve stored authentication tokens
   */
  async getStoredAuthTokens(): Promise<AuthResponse | null> {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const userId = await SecureStore.getItemAsync("userId");
      const userUuid = await SecureStore.getItemAsync("userUuid");
      const userEmail = await SecureStore.getItemAsync("userEmail");

      // Email is optional, UUID and UserID are required along with tokens
      if (accessToken && refreshToken && userId) {
        return {
          message: "User authenticated",
          accessToken,
          refreshToken,
          user: {
            uuid: userUuid || "",
            userId,
            email: userEmail || null,
          },
        };
      }

      return null;
    } catch (error) {
      console.error("Error retrieving auth tokens:", error);
      return null;
    }
  }

  /**
   * Clear stored authentication tokens (logout)
   */
  async clearAuthTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("userUuid");
      await SecureStore.deleteItemAsync("userEmail");
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getStoredAuthTokens();
    return tokens !== null;
  }

  /**
   * Store consent data locally
   */
  async storeConsent(consentData: any): Promise<void> {
    try {
      await SecureStore.setItemAsync("consentData", JSON.stringify(consentData));
    } catch (error) {
      console.error("Error storing consent:", error);
      throw error;
    }
  }

  /**
   * Retrieve stored consent data
   */
  async getStoredConsent(): Promise<any> {
    try {
      const data = await SecureStore.getItemAsync("consentData");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error retrieving consent:", error);
      return null;
    }
  }

  /**
   * Record consent to backend
   */
  async recordConsent(consentFlags: any): Promise<any> {
    try {
      const tokens = await this.getStoredAuthTokens();
      const response = await this.axiosInstance.post(
        "/consent/record",
        consentFlags,
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Consent recording (mock mode):", error);
      return { success: true };
    }
  }

  /**
   * Update consent settings
   */
  async updateConsent(updates: any): Promise<void> {
    try {
      const current = await this.getStoredConsent();
      const updated = { ...current, options: { ...current?.options, ...updates } };
      await this.storeConsent(updated);
    } catch (error) {
      console.error("Error updating consent:", error);
      throw error;
    }
  }

  /**
   * Get consent history
   */
  async getConsentHistory(): Promise<any[]> {
    try {
      const tokens = await this.getStoredAuthTokens();
      const response = await this.axiosInstance.get("/consent/history", {
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("Mock consent history");
      return [
        {
          id: "1",
          action: "Consent Accepted",
          timestamp: new Date(Date.now() - 86400000),
          details: "Passive checks enabled",
        },
      ];
    }
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(): Promise<void> {
    try {
      const current = await this.getStoredConsent();
      const updated = {
        ...current,
        options: { ...current?.options, passiveMicroChecks: false },
        status: "withdrawn",
      };
      await this.storeConsent(updated);
    } catch (error) {
      console.error("Error withdrawing consent:", error);
      throw error;
    }
  }

  /**
   * Request data export
   */
  async requestDataExport(type: "anonymized" | "pii"): Promise<void> {
    try {
      const tokens = await this.getStoredAuthTokens();
      await this.axiosInstance.post(
        "/data/export",
        { type },
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );
    } catch (error) {
      console.log("Mock data export request");
    }
  }

  /**
   * Export data
   */
  async exportData(type: "anonymized" | "pii"): Promise<string> {
    try {
      const tokens = await this.getStoredAuthTokens();
      const response = await this.axiosInstance.get("/data/export", {
        params: { type },
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return "Exported data from wellness app";
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(): Promise<void> {
    try {
      const tokens = await this.getStoredAuthTokens();
      await this.axiosInstance.post(
        "/account/delete",
        {},
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );
      await this.clearAuthTokens();
    } catch (error) {
      console.log("Mock account deletion");
      await this.clearAuthTokens();
    }
  }

  /**
   * Get sessions
   */
  async getSessions(timeRange: "day" | "week" | "month"): Promise<any[]> {
    try {
      const tokens = await this.getStoredAuthTokens();
      const response = await this.axiosInstance.get("/sessions", {
        params: { timeRange },
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("Mock sessions data");
      return [
        {
          id: "1",
          timestamp: new Date(),
          emotion: "Euthymic",
          confidence: 0.85,
          source: "face",
          context: { course: "Biology 101" },
          note: "Feeling good",
        },
      ];
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const tokens = await this.getStoredAuthTokens();
      await this.axiosInstance.delete(`/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
    } catch (error) {
      console.log("Mock session deletion");
    }
  }

  /**
   * Update session note
   */
  async updateSessionNote(sessionId: string, note: string): Promise<void> {
    try {
      const tokens = await this.getStoredAuthTokens();
      await this.axiosInstance.patch(
        `/sessions/${sessionId}`,
        { note },
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );
    } catch (error) {
      console.log("Mock session update");
    }
  }

  /**
   * Submit screening
   */
  async submitScreening(data: any): Promise<any> {
    try {
      const tokens = await this.getStoredAuthTokens();
      const response = await this.axiosInstance.post("/screening/submit", data, {
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("Mock screening submission");
      return { success: true };
    }
  }

  /**
   * Create case for therapist
   */
  async createCase(data: any): Promise<void> {
    try {
      const tokens = await this.getStoredAuthTokens();
      await this.axiosInstance.post("/cases/create", data, {
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
    } catch (error) {
      console.log("Mock case creation");
    }
  }
}

export default new ApiService();
