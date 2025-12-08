import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";

const { width: screenWidth } = Dimensions.get("window");

interface FaceScannerProps {
  onFaceCaptured: (imageUri: string, faceBase64: string) => void;
  onCancel: () => void;
}

export default function FaceScanner({ onFaceCaptured, onCancel }: FaceScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef<any>(null);

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
      });

      if (!photo || !photo.uri) {
        throw new Error("Failed to capture photo");
      }

      // Process the captured image
      const processedFace = await processImage(photo.uri);

      // Call parent callback with the face image
      onFaceCaptured(photo.uri, processedFace);
    } catch (error: any) {
      console.error("Face capture error:", error);
      Alert.alert("Error", error.message || "Failed to capture face. Please try again.");
      setProcessing(false);
    }
  };

  const processImage = async (imageUri: string): Promise<string> => {
    try {
      // Resize and compress the image
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: 512,
              height: 512,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );

      if (!processedImage.base64) {
        throw new Error("Failed to get base64 image");
      }

      return processedImage.base64;
    } catch (error) {
      console.error("Image processing error:", error);
      throw new Error("Failed to process image");
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
});