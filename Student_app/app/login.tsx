// app/login.tsx
// Production Login Screen - Implements AI_INSTRUCTIONAL_SPEC_V1
// Privacy-first, accessible, multi-language (EN/HI), analytics-enabled

import FaceScanner from '@/components/face/FaceScanner';
import { useFaceUpload } from '@/hooks/useFaceUpload';
import apiService from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
    AccessibilityInfo,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// SPEC: config_constants_to_use
const MIN_TAP_TARGET_PX = 44;
const PRIVACY_DEFAULTS = {
  raw_snapshots: 'OFF',
  send_corrections: 'OFF',
};

// SPEC: i18n_keys_required
const i18n = {
  en: {
    'login.title': 'Welcome back',
    'login.subtitle': 'Sign in to access attendance, quick wellbeing checks and personal resources.',
    'login.placeholder.email': 'Email or college ID',
    'login.placeholder.password': 'Password',
    'login.button.signin': 'Sign in',
    'login.button.sso': 'Sign in with College SSO',
    'login.button.otp': 'Sign in with OTP',
    'login.link.forgot': 'Forgot password?',
    'login.link.help': 'Need help?',
    'login.link.privacy': 'Privacy & consent',
    'login.consent.given': 'Consent: Given',
    'login.consent.pending': 'Consent: Pending',
    'login.consent.none': 'Consent: Not given',
    'login.error.default': 'Sign-in failed. Check your credentials and try again.',
    'login.error.network': 'Network error — check connection.',
    'login.error.locked': 'Account locked. Reset password or contact support.',
    'login.spinner': 'Signing in…',
    'login.toggle.remember': 'Remember me on this device',
    'login.toggle.show_password': 'Show password',
    'login.validation.email': 'Please enter a valid email or college ID.',
    'login.validation.password': 'Password must be at least 8 characters.',
  },
  hi: {
    'login.title': 'फिर से स्वागत है',
    'login.subtitle': 'उपस्थिति, त्वरित वेलबीइंग जाँच और व्यक्तिगत संसाधनों तक पहुँचने के लिए साइन इन करें।',
    'login.placeholder.email': 'ईमेल या कॉलेज आईडी',
    'login.placeholder.password': 'पासवर्ड',
    'login.button.signin': 'साइन इन',
    'login.button.sso': 'कॉलेज SSO से साइन इन करें',
    'login.button.otp': 'OTP से साइन इन करें',
    'login.link.forgot': 'पासवर्ड भूल गए?',
    'login.link.help': 'मदद चाहिए?',
    'login.link.privacy': 'गोपनीयता और सहमति',
    'login.consent.given': 'सहमति: दी गई',
    'login.consent.pending': 'सहमति: लंबित',
    'login.consent.none': 'सहमति: नहीं दी गई',
    'login.error.default': 'साइन-इन विफल हुआ। अपनी जानकारी जांचें और पुनः प्रयास करें।',
    'login.error.network': 'नेटवर्क त्रुटि — कनेक्शन जांचें।',
    'login.error.locked': 'खाता लॉक है। पासवर्ड रीसेट करें या सहायता से संपर्क करें।',
    'login.spinner': 'साइन इन हो रहा है…',
    'login.toggle.remember': 'इस डिवाइस पर मुझे याद रखें',
    'login.toggle.show_password': 'पासवर्ड दिखाएँ',
    'login.validation.email': 'कृपया मान्य ईमेल या कॉलेज आईडी दर्ज करें।',
    'login.validation.password': 'पासवर्ड कम से कम 8 अक्षर होना चाहिए।',
  },
};

// SPEC: Type definitions for API responses
interface LoginResponse {
  message?: string;
  accessToken: string;
  refreshToken: string;
  user: {
    uuid: string;
    userId: string;
    email: string;
  };
  consentStatus?: 'accepted' | 'pending' | 'none';
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

type ConsentStatus = 'given' | 'pending' | 'none';

export default function LoginScreen() {
  const router = useRouter();
  const { uploadFace, isUploading: isUploadingFace, uploadError } = useFaceUpload({
    onSuccess: (jobId) => {
      Alert.alert('Success', `Face data submitted successfully. Job ID: ${jobId}`);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
  
  // SPEC: State management for all UI elements
  const [locale, setLocale] = useState<'en' | 'hi'>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('none');
  const [showFaceScanner, setShowFaceScanner] = useState(false);

  // SPEC: Refs for accessibility and focus management
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const a11yAnnouncerRef = useRef<View>(null);

  // Helper function to get translated text
  const t = (key: string): string => {
    return (i18n[locale] as Record<string, string>)[key] || key;
  };

  // SPEC: Load consent status on mount
  useEffect(() => {
    loadConsentStatus();
    loadRememberedUser();
  }, []);

  const loadConsentStatus = async () => {
    try {
      const consent = await apiService.getStoredConsent();
      if (consent?.status === 'accepted') {
        setConsentStatus('given');
      } else if (consent?.status === 'pending') {
        setConsentStatus('pending');
      } else {
        setConsentStatus('none');
      }
    } catch (error) {
      setConsentStatus('none');
    }
  };

  const loadRememberedUser = async () => {
    try {
      const remembered = await SecureStore.getItemAsync('remembered_user');
      if (remembered) {
        setEmail(remembered);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Failed to load remembered user:', error);
    }
  };

  // SPEC: Validation functions per spec requirements
  const validateEmail = (value: string): boolean => {
    // Allow any non-empty string (removed strict email/ID regex)
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, email: t('login.validation.email') }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (value.length < 8) {
      setErrors(prev => ({ ...prev, password: t('login.validation.password') }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: undefined }));
    return true;
  };

  // SPEC: Check if form is valid (enables sign-in button)
  const isFormValid = (): boolean => {
    return (
      email.trim().length > 0 &&
      password.length >= 8 &&
      !errors.email &&
      !errors.password
    );
  };

  // SPEC: Analytics helper (emit events to telemetry layer)
  const emitAnalyticsEvent = (event: string, payload: any = {}) => {
    const basePayload = {
      timestamp: new Date().toISOString(),
      locale,
      device_id: 'anon_device_id', // Replace with actual device ID
    };
    
    console.log(`[Analytics] ${event}`, { ...basePayload, ...payload });
    // TODO: Integrate with actual analytics service (Firebase, Amplitude, etc.)
  };

  // SPEC: Accessibility announcer
  const announceToScreenReader = (message: string, assertive = false) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  // SPEC: primary_signin flow implementation
  const handleSignIn = async () => {
    // Analytics: evt_login_attempt
    emitAnalyticsEvent('evt_login_attempt', { method: 'email_password' });

    // Clear previous errors
    setErrorMessage(null);

    // Client-side validation
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    if (!emailValid || !passwordValid) {
      // SPEC: Focus first invalid input
      if (!emailValid) {
        emailInputRef.current?.focus();
      } else if (!passwordValid) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    // SPEC: Show spinner, disable inputs
    setIsLoading(true);
    announceToScreenReader(t('login.spinner'));

    try {
      // SPEC: POST /auth/login
      const response: LoginResponse = await apiService.login({
        userId: email.trim(),
        userPass: password,
      });

      // SPEC: Store token securely
      try {
        await SecureStore.setItemAsync('auth_token', response.accessToken);
      } catch (error) {
        console.error('Failed to store token:', error);
      }

      // SPEC: Handle remember me
      try {
        if (rememberMe) {
          await SecureStore.setItemAsync('remembered_user', email.trim());
        } else {
          await SecureStore.deleteItemAsync('remembered_user');
        }
      } catch (error) {
        console.error('Failed to update remember me:', error);
      }

      // Analytics: evt_login_success
      emitAnalyticsEvent('evt_login_success');

      // SPEC: Check consent status and route accordingly
      if (response.consentStatus !== 'accepted') {
        // Analytics: evt_consent_redirect
        emitAnalyticsEvent('evt_consent_redirect');
        
        announceToScreenReader('Consent required — redirecting to onboarding');
        
        // Navigate to OnboardingConsent
        router.replace('/screens/OnboardingConsent');
      } else {
        // Navigate to Home
        announceToScreenReader('Sign-in successful. Redirecting to home.');
        router.replace('/home');
      }
    } catch (error: any) {
      setIsLoading(false);
      
      // SPEC: Handle different error types
      if (error.message?.includes('network') || error.message?.includes('Network')) {
        setErrorMessage(t('login.error.network'));
        emitAnalyticsEvent('evt_login_failed', { 
          reason: 'network', 
          failed_attempts: failedAttempts + 1 
        });
      } else if (error.status === 401 || error.message?.includes('credential')) {
        setErrorMessage(t('login.error.default'));
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        emitAnalyticsEvent('evt_login_failed', { 
          reason: 'invalid_credentials', 
          failed_attempts: newFailedAttempts 
        });

        // SPEC: After 5 failed attempts, force cooldown/captcha
        if (newFailedAttempts >= 5) {
          Alert.alert(
            'Too Many Attempts',
            'Please try OTP sign-in or reset your password.',
            [
              { text: 'Try OTP', onPress: handleOTPSignIn },
              { text: 'Reset Password', onPress: handleForgotPassword },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }
      } else if (error.status === 429) {
        setErrorMessage(t('login.error.locked'));
        emitAnalyticsEvent('evt_login_failed', { 
          reason: 'account_locked', 
          failed_attempts: failedAttempts + 1 
        });
      } else {
        setErrorMessage(t('login.error.default'));
        emitAnalyticsEvent('evt_login_failed', { 
          reason: 'unknown', 
          failed_attempts: failedAttempts + 1 
        });
      }

      // SPEC: Announce error to screen reader (assertive)
      announceToScreenReader(errorMessage || t('login.error.default'), true);
    }
  };

  // SPEC: sso_signin flow
  const handleSSOSignIn = async () => {
    emitAnalyticsEvent('evt_login_attempt_sso');
    
    try {
      const ssoUrl = 'https://college.edu/sso/login'; // Replace with actual SSO URL
      const supported = await Linking.canOpenURL(ssoUrl);
      
      if (supported) {
        await Linking.openURL(ssoUrl);
        // Note: In production, implement deep link handler to receive SSO callback
      } else {
        Alert.alert('Error', 'Cannot open SSO login page.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open SSO login.');
    }
  };

  // SPEC: otp_signin flow
  const handleOTPSignIn = () => {
    emitAnalyticsEvent('evt_login_attempt_otp');
    // TODO: Navigate to OTP screen/modal
    Alert.alert('OTP Sign-in', 'OTP sign-in will be available soon.');
  };

  // SPEC: Forgot password flow
  const handleForgotPassword = () => {
    emitAnalyticsEvent('evt_forgot_password_click');
    // TODO: Navigate to forgot password flow
    Alert.alert('Forgot Password', 'Password reset will open in your browser.');
  };

  // SPEC: Help link
  const handleHelp = () => {
    emitAnalyticsEvent('evt_help_click');
    const helpUrl = 'https://support.university.edu/help';
    Linking.openURL(helpUrl);
  };

  // SPEC: Privacy & consent link
  const handlePrivacyClick = () => {
    emitAnalyticsEvent('evt_privacy_view');
    // Navigate to OnboardingConsent modal for preview
    router.push('/screens/OnboardingConsent');
  };

  // SPEC: Consent status badge tap
  const handleConsentBadgeTap = () => {
    if (consentStatus !== 'given') {
      emitAnalyticsEvent('evt_consent_redirect');
      router.push('/screens/OnboardingConsent');
    }
  };

  // SPEC: Locale switcher
  const handleLocaleChange = async (newLocale: 'en' | 'hi') => {
    setLocale(newLocale);
    try {
      await SecureStore.setItemAsync('app_locale', newLocale);
    } catch (error) {
      console.error('Failed to save locale:', error);
    }
  };

  // SPEC: Face scanner handlers
  const handleFaceCapture = async (imageUri: string, faceBase64: string) => {
    try {
      setShowFaceScanner(false);
      
      // Check if user is logged in
      const tokens = await apiService.getStoredAuthTokens();
      if (!tokens?.accessToken) {
        Alert.alert(
          'Login Required',
          'Please sign in first before capturing face data.'
        );
        return;
      }

      // Upload encrypted face data
      await uploadFace(faceBase64);
      emitAnalyticsEvent('evt_face_capture_success');
    } catch (error: any) {
      emitAnalyticsEvent('evt_face_capture_failed', { error: error.message });
      Alert.alert('Face Upload Error', error.message || 'Failed to upload face data.');
    }
  };

  const handleFaceScannerCancel = () => {
    setShowFaceScanner(false);
    emitAnalyticsEvent('evt_face_capture_cancelled');
  };

  const handleFaceCaptureClick = () => {
    emitAnalyticsEvent('evt_face_capture_initiated');
    setShowFaceScanner(true);
  };

  // SPEC: Get consent badge color and text
  const getConsentBadge = () => {
    const badges = {
      given: { text: t('login.consent.given'), color: styles.consentGiven },
      pending: { text: t('login.consent.pending'), color: styles.consentPending },
      none: { text: t('login.consent.none'), color: styles.consentNone },
    };
    return badges[consentStatus];
  };

  const consentBadge = getConsentBadge();

  return (
    <KeyboardAvoidingView
      testID="login_screen"
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* SPEC: Locale Selector */}
        <View style={styles.localeContainer}>
          <TouchableOpacity
            testID="login_locale_selector"
            style={[styles.localeButton, locale === 'en' && styles.localeButtonActive]}
            onPress={() => handleLocaleChange('en')}
            accessibilityRole="button"
            accessibilityLabel="Switch to English"
          >
            <Text style={[styles.localeText, locale === 'en' && styles.localeTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.localeButton, locale === 'hi' && styles.localeButtonActive]}
            onPress={() => handleLocaleChange('hi')}
            accessibilityRole="button"
            accessibilityLabel="हिंदी में बदलें"
          >
            <Text style={[styles.localeText, locale === 'hi' && styles.localeTextActive]}>
              हिंदी
            </Text>
          </TouchableOpacity>
        </View>

        {/* SPEC: Logo */}
        <View style={styles.logoContainer}>
          <View
            testID="login_logo"
            style={styles.logoPlaceholder}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={locale === 'en' ? 'App logo' : 'ऐप का लोगो'}
          >
            <Ionicons name="school" size={48} color="#007AFF" />
          </View>
        </View>

        {/* SPEC: Title & Subtitle */}
        <View style={styles.headerSection}>
          <Text
            testID="login_title"
            style={styles.title}
            accessibilityRole="header"
          >
            {t('login.title')}
          </Text>
          <Text
            testID="login_subtitle"
            style={styles.subtitle}
            accessibilityRole="text"
          >
            {t('login.subtitle')}
          </Text>
        </View>

        {/* SPEC: Consent Status Badge */}
        <TouchableOpacity
          testID="login_consent_status"
          style={[styles.consentBadge, consentBadge.color]}
          onPress={handleConsentBadgeTap}
          accessibilityRole="button"
          accessibilityLabel={consentBadge.text}
          accessibilityHint="Tap to view consent details"
        >
          <Ionicons
            name={consentStatus === 'given' ? 'checkmark-circle' : 'alert-circle'}
            size={16}
            color="#fff"
          />
          <Text style={styles.consentBadgeText}>{consentBadge.text}</Text>
        </TouchableOpacity>

        {/* SPEC: Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={emailInputRef}
            testID="login_email_input"
            style={[styles.input, errors.email && styles.inputError]}
            placeholder={t('login.placeholder.email')}
            placeholderTextColor="#9AA4B2"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) validateEmail(text);
            }}
            onBlur={() => validateEmail(email)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!isLoading}
            accessible={true}
            accessibilityLabel={
              locale === 'en' 
                ? 'Email or college ID input' 
                : 'ईमेल या कॉलेज आईडी इनपुट'
            }
            accessibilityHint={
              locale === 'en'
                ? 'Enter your email or your college identification number'
                : 'अपना ईमेल या कॉलेज आईडी दर्ज करें'
            }
          />
          {errors.email && (
            <Text
              testID="login_error_email"
              style={styles.errorText}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              {errors.email}
            </Text>
          )}
        </View>

        {/* SPEC: Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              ref={passwordInputRef}
              testID="login_password_input"
              style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
              placeholder={t('login.placeholder.password')}
              placeholderTextColor="#9AA4B2"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) validatePassword(text);
              }}
              onBlur={() => validatePassword(password)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              accessible={true}
              accessibilityLabel={
                locale === 'en' ? 'Password field' : 'पासवर्ड फ़ील्ड'
              }
              accessibilityHint={
                locale === 'en' 
                  ? 'Double tap to enter password' 
                  : 'पासवर्ड दर्ज करने के लिए डबल टैप करें'
              }
            />
            <TouchableOpacity
              testID="login_show_password_toggle"
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityRole="button"
              accessibilityLabel={t('login.toggle.show_password')}
              accessibilityState={{ checked: showPassword }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#9AA4B2"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text
              testID="login_error_password"
              style={styles.errorText}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              {errors.password}
            </Text>
          )}
        </View>

        {/* SPEC: Remember Me Toggle */}
        <TouchableOpacity
          testID="login_remember_toggle"
          style={styles.rememberMeContainer}
          onPress={() => setRememberMe(!rememberMe)}
          accessibilityRole="checkbox"
          accessibilityLabel={t('login.toggle.remember')}
          accessibilityState={{ checked: rememberMe }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.rememberMeText}>{t('login.toggle.remember')}</Text>
        </TouchableOpacity>

        {/* SPEC: Error Message Display */}
        {errorMessage && (
          <View
            testID="login_error_message"
            style={styles.errorMessageContainer}
            accessible={true}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            <Ionicons name="alert-circle" size={20} color="#E07A5F" />
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          </View>
        )}

        {/* SPEC: Sign In Button */}
        <TouchableOpacity
          testID="login_signin_button"
          style={[
            styles.signInButton,
            (!isFormValid() || isLoading) && styles.signInButtonDisabled,
          ]}
          onPress={handleSignIn}
          disabled={!isFormValid() || isLoading}
          accessibilityRole="button"
          accessibilityLabel={t('login.button.signin')}
          accessibilityState={{ disabled: !isFormValid() || isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator
              testID="login_spinner"
              color="#fff"
              accessibilityLabel={t('login.spinner')}
            />
          ) : (
            <Text style={styles.signInButtonText}>{t('login.button.signin')}</Text>
          )}
        </TouchableOpacity>

        {/* SPEC: Face Capture Button (After successful login) */}
        <TouchableOpacity
          testID="login_face_capture_button"
          style={[
            styles.alternativeButton,
            isUploadingFace && styles.alternativeButtonDisabled,
          ]}
          onPress={handleFaceCaptureClick}
          disabled={isUploadingFace}
          accessibilityRole="button"
          accessibilityLabel="Capture face for emotion recognition"
          accessibilityHint="Use your device camera to capture a face image for emotion analysis"
        >
          {isUploadingFace ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <>
              <Ionicons name="camera" size={20} color="#007AFF" />
              <Text style={styles.alternativeButtonText}>Capture Face</Text>
            </>
          )}
        </TouchableOpacity>

        {/* SPEC: Alternative Sign-in Methods */}
        <View style={styles.alternativeSignInSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            testID="login_sso_button"
            style={styles.alternativeButton}
            onPress={handleSSOSignIn}
            accessibilityRole="button"
            accessibilityLabel={t('login.button.sso')}
          >
            <Ionicons name="business" size={20} color="#007AFF" />
            <Text style={styles.alternativeButtonText}>
              {t('login.button.sso')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="login_otp_button"
            style={styles.alternativeButton}
            onPress={handleOTPSignIn}
            accessibilityRole="button"
            accessibilityLabel={t('login.button.otp')}
          >
            <Ionicons name="phone-portrait" size={20} color="#007AFF" />
            <Text style={styles.alternativeButtonText}>
              {t('login.button.otp')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SPEC: Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity
            testID="login_forgot_password_link"
            onPress={handleForgotPassword}
            accessibilityRole="link"
            accessibilityLabel={t('login.link.forgot')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.linkText}>{t('login.link.forgot')}</Text>
          </TouchableOpacity>

          <View style={styles.footerDivider} />

          <TouchableOpacity
            testID="login_help_link"
            onPress={handleHelp}
            accessibilityRole="link"
            accessibilityLabel={t('login.link.help')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.linkText}>{t('login.link.help')}</Text>
          </TouchableOpacity>

          <View style={styles.footerDivider} />

          <TouchableOpacity
            testID="login_privacy_link"
            onPress={handlePrivacyClick}
            accessibilityRole="link"
            accessibilityLabel={t('login.link.privacy')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.linkText}>{t('login.link.privacy')}</Text>
          </TouchableOpacity>
        </View>

        {/* SPEC: Accessibility Live Region for Screen Reader Announcements */}
        <View
          ref={a11yAnnouncerRef}
          testID="login_a11y_announcer"
          accessible={true}
          accessibilityLiveRegion="polite"
          style={styles.a11yHidden}
        />
      </ScrollView>

      {/* SPEC: Face Scanner Modal */}
      <Modal
        visible={showFaceScanner}
        animationType="slide"
        onRequestClose={handleFaceScannerCancel}
      >
        <FaceScanner
          onFaceCaptured={handleFaceCapture}
          onCancel={handleFaceScannerCancel}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

// SPEC: visual_and_style_guidance implementation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  localeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 24,
  },
  localeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minHeight: MIN_TAP_TARGET_PX,
    minWidth: MIN_TAP_TARGET_PX,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localeButtonActive: {
    backgroundColor: '#007AFF',
  },
  localeText: {
    fontSize: 14,
    color: '#9AA4B2',
    fontWeight: '600',
  },
  localeTextActive: {
    color: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F1724',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9AA4B2',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  consentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    gap: 6,
    minHeight: MIN_TAP_TARGET_PX,
  },
  consentGiven: {
    backgroundColor: '#2E9E6D',
  },
  consentPending: {
    backgroundColor: '#FF9500',
  },
  consentNone: {
    backgroundColor: '#E07A5F',
  },
  consentBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E4E8',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F1724',
    minHeight: MIN_TAP_TARGET_PX,
  },
  inputError: {
    borderColor: '#E07A5F',
    borderWidth: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
    minHeight: MIN_TAP_TARGET_PX,
    minWidth: MIN_TAP_TARGET_PX,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E07A5F',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
    minHeight: MIN_TAP_TARGET_PX,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9AA4B2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  rememberMeText: {
    fontSize: 15,
    color: '#0F1724',
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#E07A5F',
  },
  errorMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#E07A5F',
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: MIN_TAP_TARGET_PX,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonDisabled: {
    backgroundColor: '#9AA4B2',
    shadowOpacity: 0,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  alternativeSignInSection: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E4E8',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#9AA4B2',
    fontWeight: '600',
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E4E8',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 10,
    minHeight: MIN_TAP_TARGET_PX,
  },
  alternativeButtonDisabled: {
    opacity: 0.6,
  },
  alternativeButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E4E8',
    marginHorizontal: 4,
  },
  a11yHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
