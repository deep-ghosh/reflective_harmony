import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import apiService from "../../services/api";
import encryptionService from "../../services/encryption";
import FaceScanner from "../../components/face/FaceScanner";

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [uploading, setUploading] = useState(false);

  const checkAuthentication = useCallback(async () => {
    try {
      const authenticated = await apiService.isAuthenticated();

      if (!authenticated) {
        // Redirect to login if not authenticated
        router.replace("../login" as any);
      }
    } catch (error) {
      console.error("Authentication check error:", error);
      router.replace("../login" as any);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleScanFace = () => {
    setShowScanner(true);
  };

  const handleFaceCaptured = async (imageUri: string, faceBase64: string) => {
    setShowScanner(false);
    setUploading(true);

    try {
      // Get authentication tokens
      const tokens = await apiService.getStoredAuthTokens();
      if (!tokens) {
        throw new Error("Authentication tokens not found. Please login again.");
      }

      // Use userId as encryption key (derived from tokens)
      const encryptionKey = tokens.user.userId;

      // Encrypt the face image
      const encryptedFace = encryptionService.encryptImage(faceBase64, encryptionKey);

      // Upload encrypted face to server
      await apiService.uploadFaceImage(encryptedFace, tokens.accessToken);

      Alert.alert("Success", "Face uploaded successfully! Your attendance has been recorded.", [
        { text: "OK" },
      ]);
    } catch (error: any) {
      console.error("Face upload error:", error);
      Alert.alert("Upload Failed", error.message || "Failed to upload face image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelScan = () => {
    setShowScanner(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await apiService.clearAuthTokens();
          router.replace("../login" as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitle}>University Portal</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="scan-outline" size={64} color="#007AFF" />
          </View>
          <Text style={styles.cardTitle}>Face Recognition</Text>
          <Text style={styles.cardDescription}>
            Scan your face to mark your attendance and verify your identity
          </Text>

          <TouchableOpacity
            style={[styles.scanButton, uploading && styles.scanButtonDisabled]}
            onPress={handleScanFace}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.scanButtonText}>Scan Face</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={32} color="#34C759" />
            <Text style={styles.infoTitle}>Secure</Text>
            <Text style={styles.infoText}>Your face data is encrypted before transmission</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="flash" size={32} color="#FF9500" />
            <Text style={styles.infoTitle}>Fast</Text>
            <Text style={styles.infoText}>Quick face detection and verification process</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>
            <Ionicons name="information-circle" size={20} color="#007AFF" /> How to use
          </Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>Press the Scan Face button above</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>Position your face within the circular frame</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>Make sure you are in good lighting</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>Press the capture button to take the photo</Text>
          </View>
        </View>
      </ScrollView>

      {/* Face Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" presentationStyle="fullScreen">
        <FaceScanner onFaceCaptured={handleFaceCaptured} onCancel={handleCancelScan} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonDisabled: {
    backgroundColor: "#999",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  infoSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 12,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  instructionsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginRight: 12,
    width: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
});
