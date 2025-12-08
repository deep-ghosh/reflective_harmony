import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Image } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import faceUploadService from "../../services/faceUploadService";

const { width: screenWidth } = Dimensions.get("window");

export default function FaceScanner() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const onCancel = () => {
    router.back();
  };

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const captureFace = async () => {
    if (!cameraRef.current || processing) return;

    setProcessing(true);

    try {
      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });

      if (!photo || !photo.uri) {
        throw new Error("Failed to capture photo");
      }

      // Calculate center crop
      const { width, height } = photo;
      const size = Math.min(width, height);
      const originX = (width - size) / 2;
      const originY = (height - size) / 2;

      // Crop the image to a square
      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: { originX, originY, width: size, height: size } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCapturedImage(cropped.uri);
    } catch (error: any) {
      console.error("Face capture error:", error);
      Alert.alert("Error", error.message || "Failed to capture face. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSubmit = async () => {
    if (!capturedImage || processing) return;

    setProcessing(true);
    try {
      // Resize to 512x512 and get base64
      const processedImage = await ImageManipulator.manipulateAsync(
        capturedImage,
        [{ resize: { width: 512, height: 512 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!processedImage.base64) {
        throw new Error("Failed to process image");
      }

      // Use the centralized face upload service
      await faceUploadService.handleFaceCaptureEncryption(processedImage.base64);

      Alert.alert("Success", "Attendance marked successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error("Submission error:", error);
      Alert.alert("Error", error.message || "Failed to submit face. Please try again.");
      setProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Confirm Face</Text>
          <View style={styles.previewImageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          </View>
          
          <View style={styles.previewControls}>
             <TouchableOpacity style={styles.retakeButton} onPress={handleRetake} disabled={processing}>
              <Text style={styles.controlButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={processing}
            >
               {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.controlButtonText}>Submit</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Face Detection Overlay - Centered */}
        <View style={styles.overlayContainer}>
          {/* Semi-transparent overlay covering entire screen */}
          <View style={styles.fullOverlay} />
          
          {/* Centered face frame cutout */}
          <View style={styles.centeredFaceFrame}>
            <View style={styles.faceFrame} />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.cancelButtonCamera} onPress={onCancel} disabled={processing}>
            <Text style={styles.controlButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, processing && styles.captureButtonDisabled]}
            onPress={captureFace}
            disabled={processing}
          >
            {processing ? <ActivityIndicator color="#fff" /> : <View style={styles.captureButtonInner} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing(facing === "back" ? "front" : "back")}
            disabled={processing}
          >
            <Text style={styles.controlButtonText}>Flip</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  centeredFaceFrame: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  faceFrame: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: screenWidth * 0.4,
    backgroundColor: "transparent",
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  cancelButtonCamera: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    borderRadius: 25,
  },
  flipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  // Preview Styles
  previewContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  previewImageContainer: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: screenWidth * 0.4,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 40,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  retakeButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 12,
  },
  submitButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
});