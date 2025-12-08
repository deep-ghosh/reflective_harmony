# University Face Recognition App

A React Native mobile application built with Expo for university student authentication and face-based attendance verification.

## Features

- **Student Login**: Secure authentication with Student ID and password
- **Face Scanning**: Real-time face detection using device camera
- **AI Face Detection**: Automatic face detection and extraction
- **Encrypted Upload**: Face images are encrypted before transmission
- **Secure Storage**: Authentication tokens stored securely on device

## Architecture

### Authentication Flow
1. Student logs in with Student ID and password
2. Server returns:
   - Access Token (for API authorization)
   - Service Token (for additional services)
   - Encryption Key (for face image encryption)
3. Tokens are stored securely using Expo SecureStore

### Face Scanning Flow
1. User opens camera from home screen
2. AI detects face in real-time
3. Face is detected → user captures photo
4. Face is extracted and cropped from photo
5. Face image is encrypted using the encryption key
6. Encrypted image is uploaded to server with access token

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Physical device for testing camera features (recommended)

## Installation

1. **Clone the repository** (if applicable)
   ```bash
   cd Student_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Open `config/api.config.ts` and update the `BASE_URL`:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'https://your-university-api.com/api',
     // ...
   };
   ```

## Running the App

### Development Mode

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web (limited camera functionality)
npm run web
```

### Testing on Physical Device

1. Install Expo Go app on your device
2. Run `npm start`
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

## Project Structure

```
Student_app/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home screen with face scanner
│   │   └── explore.tsx      # Explore tab
│   ├── _layout.tsx          # Root navigation layout
│   └── login.tsx            # Login screen
├── components/              # Reusable components
│   └── face/
│       └── FaceScanner.tsx  # Face scanner component
├── services/                # Business logic services
│   ├── api.ts              # API service for HTTP requests
│   └── encryption.ts       # Encryption service
├── config/                  # Configuration files
│   └── api.config.ts       # API configuration
├── assets/                  # Images, fonts, etc.
├── app.json                # Expo configuration
└── package.json            # Dependencies
```

## Key Dependencies

- **expo-camera**: Camera access and photo capture
- **expo-face-detector**: Real-time face detection
- **expo-image-manipulator**: Image cropping and manipulation
- **expo-secure-store**: Secure token storage
- **axios**: HTTP client for API requests
- **crypto-js**: Encryption library
- **expo-router**: File-based navigation

## API Endpoints

The app expects the following API endpoints:

### 1. Login
**POST** `/auth/login`

**Request:**
```json
{
  "studentID": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "serviceToken": "string",
  "encryptionKey": "string"
}
```

### 2. Face Upload
**POST** `/face/upload`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "faceImage": "encrypted_base64_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Face uploaded successfully",
  "attendanceId": "string"
}
```

## Security Features

1. **Secure Token Storage**: All authentication tokens are stored using Expo SecureStore, which uses:
   - Keychain on iOS
   - EncryptedSharedPreferences on Android

2. **Image Encryption**: Face images are encrypted using AES encryption before transmission

3. **HTTPS**: All API calls should be made over HTTPS

4. **Token-based Authentication**: Bearer token authentication for API requests

## Permissions

The app requires the following permissions:

### iOS
- Camera access (NSCameraUsageDescription)
- Face detection (NSFaceIDUsageDescription)

### Android
- CAMERA
- READ_EXTERNAL_STORAGE (for saving photos)
- WRITE_EXTERNAL_STORAGE (for saving photos)

Permissions are requested at runtime when needed.

## Configuration

### API Configuration
Edit `config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-api-url.com/api',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    FACE_UPLOAD: '/face/upload',
  },
  TIMEOUT: 30000,
};
```

### Encryption
The encryption service uses AES encryption from crypto-js. The encryption key is provided by the server during login.

## Troubleshooting

### Camera not working
- Ensure you've granted camera permissions
- Test on a physical device (camera may not work in simulator)
- Check that expo-camera is properly installed

### Face detection not working
- Ensure good lighting conditions
- Position face clearly within the frame
- Try on a physical device (face detection may be limited in emulator)

### Login fails
- Verify API endpoint URL in `config/api.config.ts`
- Check network connectivity
- Verify credentials with your university portal

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start -c
```

## Building for Production

### Android
```bash
# Build APK
eas build --platform android --profile production

# Or using Expo
npx expo build:android
```

### iOS
```bash
# Build IPA (requires Apple Developer account)
eas build --platform ios --profile production

# Or using Expo
npx expo build:ios
```

## Environment Variables

For production, consider using environment variables:

1. Create `.env` file (don't commit to git):
```env
API_BASE_URL=https://your-production-api.com/api
```

2. Install dotenv:
```bash
npm install react-native-dotenv
```

3. Update config to use environment variables

## Testing

The app uses:
- Manual testing for camera and face detection
- Real device testing recommended for camera features

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Expo documentation: https://docs.expo.dev/
3. Contact your university IT department for API-related issues

## License

This project is licensed under the terms specified by your university.

## Version History

### v1.0.0 (Initial Release)
- Student login with ID and password
- Face scanning with real-time detection
- Encrypted face image upload
- Secure token storage
- Cross-platform support (iOS/Android)

## Contributing

If you're part of the development team:
1. Create a feature branch
2. Make your changes
3. Test thoroughly on both iOS and Android
4. Submit a pull request

## Notes

- **Camera Testing**: Always test camera features on physical devices
- **Face Detection**: Works best in good lighting with clear face visibility
- **Security**: Never commit API keys or sensitive credentials to version control
- **Production**: Update API_BASE_URL before building for production

---

**Built with ❤️ using Expo and React Native**