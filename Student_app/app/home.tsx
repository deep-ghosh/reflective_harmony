// app/home.tsx
// Student Home Dashboard - Government-Grade Interface
// CRITICAL: NO emotional labels, mood states, or wellbeing analysis shown to students
// Spec: student_home_dashboard - Zero-stress, attendance-first design

import apiService from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// SPEC: Constants for accessibility
const MIN_TAP_TARGET_PX = 44;

// SPEC: i18n_keys_required - Multi-language support
const i18n = {
  en: {
    'home.welcome': 'Welcome',
    'home.tip': 'Tip of the day: Take a 5-minute break to stay focused.',
    'home.attendance': 'Mark Attendance',
    'home.attendance.subtitle': 'Quick and easy face check-in',
    'home.tools': 'Your Tools',
    'home.focus': 'Focus & Calm',
    'home.focus.subtitle': 'Guided neuromodulation sessions',
    'home.resources': 'Resource Hub',
    'home.resources.subtitle': 'Calming • Sleep • Focus • Study tracks',
    'home.community': 'Anonymous Community',
    'home.community.subtitle': 'Share and support each other',
    'home.activities': 'My Activities',
    'home.activities.subtitle': 'Your past attendance logs',
    'home.help': 'Help',
    'home.emergency': 'Emergency Helpline',
  },
  hi: {
    'home.welcome': 'स्वागत है',
    'home.tip': 'आज का सुझाव: ध्यान केंद्रित रखने के लिए 5 मिनट का ब्रेक लें।',
    'home.attendance': 'उपस्थिति दर्ज करें',
    'home.attendance.subtitle': 'त्वरित और आसान फेस चेक-इन',
    'home.tools': 'आपके उपकरण',
    'home.focus': 'फोकस और शांति',
    'home.focus.subtitle': 'मार्गदर्शित न्यूरोमॉड्यूलेशन सत्र',
    'home.resources': 'रिसोर्स हब',
    'home.resources.subtitle': 'शांति • नींद • ध्यान • अध्ययन',
    'home.community': 'अनाम समुदाय',
    'home.community.subtitle': 'साझा करें और एक-दूसरे का समर्थन करें',
    'home.activities': 'मेरी गतिविधियाँ',
    'home.activities.subtitle': 'आपके पिछले उपस्थिति लॉग',
    'home.help': 'मदद',
    'home.emergency': 'आपातकालीन हेल्पलाइन',
  },
};

export default function StudentHomeDashboard() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locale, setLocale] = useState<'en' | 'hi'>('en');
  const [userName, setUserName] = useState<string>('');
  const [showTip, setShowTip] = useState(true);
  const [showHelpline, setShowHelpline] = useState(false);

  // Helper to get translated text
  const t = (key: string): string => {
    return (i18n[locale] as Record<string, string>)[key] || key;
  };

  useEffect(() => {
    // SPEC: Analytics event - evt_home_loaded
    emitAnalyticsEvent('evt_home_loaded');
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const tokens = await apiService.getStoredAuthTokens();
      if (tokens?.user?.userId) {
        setUserName(tokens.user.userId);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  // SPEC: Analytics helper
  const emitAnalyticsEvent = (event: string, payload: any = {}) => {
    const basePayload = {
      timestamp: new Date().toISOString(),
      locale,
    };
    console.log(`[Analytics] ${event}`, { ...basePayload, ...payload });
    // TODO: Integrate with actual analytics service
  };

  // SPEC: Navigation handlers with analytics
  const handleAttendanceTap = async () => {
    emitAnalyticsEvent('evt_home_attendance_tap');
    
    try {
      // Pre-check camera permissions
      if (!cameraPermission) {
        // First time - permission status unknown
        const result = await requestCameraPermission();
        
        if (result.granted) {
          console.log('[Analytics] evt_attendance_camera_prewarm');
          router.push('/screens/AttendanceScreen?prewarm=true');
        } else {
          router.push('/screens/AttendanceScreen');
        }
        return;
      }
      
      if (cameraPermission.granted) {
        // Permission already granted - prewarm camera
        console.log('[Analytics] evt_attendance_camera_prewarm');
        router.push('/screens/AttendanceScreen?prewarm=true');
      } else if (cameraPermission.canAskAgain) {
        // Can request permission
        const result = await requestCameraPermission();
        
        if (result.granted) {
          router.push('/screens/AttendanceScreen?prewarm=true');
        } else {
          router.push('/screens/AttendanceScreen');
        }
      } else {
        // Permission permanently denied - go to guide
        router.push('/screens/AttendanceScreen');
      }
      
    } catch (error) {
      console.error('[Analytics] evt_camera_error', { 
        error: String(error),
        location: 'home_attendance_tap'
      });
      // Fallback - navigate anyway
      router.push('/screens/AttendanceScreen');
    }
  };

  const handleFocusCalmTap = () => {
    emitAnalyticsEvent('evt_home_focuscalm_tap');
    router.push('/screens/Resources');
  };

  const handleResourceHubTap = () => {
    emitAnalyticsEvent('evt_home_resourcehub_tap');
    router.push('/screens/Resources');
  };

  const handleCommunityTap = () => {
    emitAnalyticsEvent('evt_home_group_tap');
    router.push('/screens/AnonymousUserAnalytics');
  };

  const handleActivitiesTap = () => {
    emitAnalyticsEvent('evt_home_sessions_tap');
    router.push('/screens/MyActivity');
  };

  const handleChatbotTap = () => {
    emitAnalyticsEvent('evt_home_chatbot_open');
    router.push('/screens/Chatbot');
  };

  const handleProfileTap = () => {
    router.push('/screens/PrivacySettings');
  };

  const handleEmergencyTap = () => {
    setShowHelpline(true);
  };

  return (
    <View
      testID="home_screen_root"
      style={styles.container}
      accessible={true}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SPEC: home_header_section */}
        <View style={styles.headerSection}>
          <View style={styles.headerLeft}>
            <Text
              testID="home_header_greeting"
              style={styles.greeting}
              accessibilityRole="header"
            >
              {t('home.welcome')}
              {userName ? `, ${userName}` : ''}
            </Text>
            <Text style={styles.subGreeting}>
              {new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'hi-IN', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            testID="home_header_avatar"
            style={styles.avatarButton}
            onPress={handleProfileTap}
            accessible={true}
            accessibilityLabel={locale === 'en' ? 'Open profile' : 'प्रोफ़ाइल खोलें'}
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#007AFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* SPEC: home_daily_tip_section */}
        {showTip && (
          <View
            testID="home_daily_tip_banner"
            style={styles.tipBanner}
            accessible={true}
          >
            <View style={styles.tipContent}>
              <Ionicons name="bulb" size={20} color="#FF9500" />
              <Text style={styles.tipText}>{t('home.tip')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowTip(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityLabel="Dismiss tip"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* SPEC: home_primary_feature_section - Attendance Card (HIGHEST PRIORITY) */}
        <TouchableOpacity
          testID="home_attendance_card"
          style={styles.attendanceCard}
          onPress={handleAttendanceTap}
          accessible={true}
          accessibilityLabel={t('home.attendance')}
          accessibilityHint={t('home.attendance.subtitle')}
          accessibilityRole="button"
          activeOpacity={0.9}
        >
          <View
            style={styles.attendanceGradient}
          >
            <View style={styles.attendanceIconContainer}>
              <Ionicons name="camera" size={48} color="#fff" />
            </View>
            <Text style={styles.attendanceTitle}>{t('home.attendance')}</Text>
            <Text style={styles.attendanceSubtitle}>
              {t('home.attendance.subtitle')}
            </Text>
            <View style={styles.attendanceArrow}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* SPEC: home_tools_section */}
        <View style={styles.toolsSection}>
          <Text
            testID="home_tools_section_header"
            style={styles.sectionHeader}
            accessibilityRole="header"
          >
            {t('home.tools')}
          </Text>

          {/* SPEC: Tool Grid - 2 columns */}
          <View style={styles.toolsGrid}>
            {/* SPEC: home_tool_neuromodulation */}
            <ToolCard
              testID="home_tool_neuromodulation"
              icon="pulse"
              iconColor="#FF9500"
              title={t('home.focus')}
              subtitle={t('home.focus.subtitle')}
              onPress={handleFocusCalmTap}
              accessibilityLabel="Focus & Calm button"
            />

            {/* SPEC: home_tool_resource_hub */}
            <ToolCard
              testID="home_tool_resource_hub"
              icon="musical-notes"
              iconColor="#34C759"
              title={t('home.resources')}
              subtitle={t('home.resources.subtitle')}
              onPress={handleResourceHubTap}
              accessibilityLabel="Resource Hub button"
            />

            {/* SPEC: home_tool_anonymous_group */}
            <ToolCard
              testID="home_tool_anonymous_group"
              icon="people"
              iconColor="#5856D6"
              title={t('home.community')}
              subtitle={t('home.community.subtitle')}
              onPress={handleCommunityTap}
              accessibilityLabel="Anonymous Community button"
            />

            {/* SPEC: home_tool_my_sessions */}
            <ToolCard
              testID="home_tool_my_sessions"
              icon="time"
              iconColor="#007AFF"
              title={t('home.activities')}
              subtitle={t('home.activities.subtitle')}
              onPress={handleActivitiesTap}
              accessibilityLabel="My Activities button"
            />
          </View>
        </View>

        {/* SPEC: home_footer_section - Emergency Support Link */}
        <TouchableOpacity
          testID="home_emergency_support_link"
          style={styles.emergencyLink}
          onPress={handleEmergencyTap}
          accessible={true}
          accessibilityLabel={t('home.emergency')}
          accessibilityRole="link"
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="call" size={16} color="#FF3B30" />
          <Text style={styles.emergencyText}>{t('home.emergency')}</Text>
        </TouchableOpacity>

        {/* Bottom padding for FAB clearance */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* SPEC: home_chatbot_section - Floating Action Button */}
      <TouchableOpacity
        testID="home_chatbot_fab"
        style={styles.chatbotFab}
        onPress={handleChatbotTap}
        accessible={true}
        accessibilityLabel={t('home.help')}
        accessibilityHint="Open help chatbot"
        accessibilityRole="button"
        activeOpacity={0.9}
      >
        <View
          style={styles.fabGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Emergency Helpline Modal */}
      <Modal
        visible={showHelpline}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowHelpline(false)}
      >
        <HelplineModal
          locale={locale}
          onClose={() => setShowHelpline(false)}
        />
      </Modal>
    </View>
  );
}

// SPEC: Reusable Tool Card Component
interface ToolCardProps {
  testID: string;
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel: string;
}

function ToolCard({
  testID,
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
}: ToolCardProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={styles.toolCard}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      <View style={[styles.toolIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon as any} size={32} color={iconColor} />
      </View>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

// Emergency Helpline Modal Component
function HelplineModal({ locale, onClose }: { locale: 'en' | 'hi'; onClose: () => void }) {
  const helplines = [
    {
      name: locale === 'en' ? 'Mental Health Helpline' : 'मानसिक स्वास्थ्य हेल्पलाइन',
      number: '1800-599-0019',
      available: locale === 'en' ? '24/7' : '24/7',
    },
    {
      name: locale === 'en' ? 'Student Support' : 'छात्र सहायता',
      number: '1800-180-1104',
      available: locale === 'en' ? 'Mon-Fri, 9 AM - 6 PM' : 'सोम-शुक्र, 9 AM - 6 PM',
    },
    {
      name: locale === 'en' ? 'Crisis Helpline' : 'संकट हेल्पलाइन',
      number: '9152987821',
      available: locale === 'en' ? '24/7' : '24/7',
    },
  ];

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {locale === 'en' ? 'Emergency Support' : 'आपातकालीन सहायता'}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.modalSubtitle}>
          {locale === 'en'
            ? 'These helplines are available for support and guidance.'
            : 'ये हेल्पलाइनें सहायता और मार्गदर्शन के लिए उपलब्ध हैं।'}
        </Text>

        {helplines.map((helpline, index) => (
          <TouchableOpacity
            key={index}
            style={styles.helplineCard}
            onPress={() => handleCall(helpline.number)}
            accessible={true}
            accessibilityLabel={`Call ${helpline.name}`}
            accessibilityRole="button"
          >
            <View style={styles.helplineIcon}>
              <Ionicons name="call" size={24} color="#007AFF" />
            </View>
            <View style={styles.helplineInfo}>
              <Text style={styles.helplineName}>{helpline.name}</Text>
              <Text style={styles.helplineNumber}>{helpline.number}</Text>
              <Text style={styles.helplineAvailable}>{helpline.available}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}

        <View style={styles.modalFooter}>
          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
          <Text style={styles.modalFooterText}>
            {locale === 'en'
              ? 'All calls are confidential and free'
              : 'सभी कॉल गोपनीय और निःशुल्क हैं'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// SPEC: Visual styling - Calm, neutral, government-grade design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F1724',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#9AA4B2',
  },
  avatarButton: {
    minWidth: MIN_TAP_TARGET_PX,
    minHeight: MIN_TAP_TARGET_PX,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8E1',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  tipContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  attendanceCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: MIN_TAP_TARGET_PX * 3,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  attendanceGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    backgroundColor: '#007AFF',
  },
  attendanceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendanceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  attendanceSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  attendanceArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F1724',
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1724',
    marginBottom: 6,
  },
  toolSubtitle: {
    fontSize: 13,
    color: '#9AA4B2',
    lineHeight: 18,
  },
  emergencyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    marginHorizontal: 20,
    paddingVertical: 12,
    minHeight: MIN_TAP_TARGET_PX,
  },
  emergencyText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
  chatbotFab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#5856D6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5856D6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F1724',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: MIN_TAP_TARGET_PX,
  },
  helplineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helplineInfo: {
    flex: 1,
  },
  helplineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F1724',
    marginBottom: 4,
  },
  helplineNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  helplineAvailable: {
    fontSize: 12,
    color: '#999',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalFooterText: {
    fontSize: 13,
    color: '#666',
  },
});
