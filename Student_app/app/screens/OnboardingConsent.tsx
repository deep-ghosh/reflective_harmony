import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

export default function OnboardingConsent() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [consentOptions, setConsentOptions] = useState({
    passiveMicroChecks: true,
    saveRawSnapshots: false,
    sendCorrections: false,
  });

  const handleAcceptAndCalibrate = async () => {
    setLoading(true);
    try {
      const consentData = {
        timestamp: new Date().toISOString(),
        options: consentOptions,
        status: 'accepted',
      };

      await apiService.storeConsent(consentData);
      await apiService.recordConsent({
        consentFlags: consentOptions,
        timestamp: consentData.timestamp,
      });

      router.push('/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save consent. Please try again.');
      console.error('Consent error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Manual Check-in Mode',
      'Without passive monitoring, you will need to manually check in daily. Continue?',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            await apiService.storeConsent({
              timestamp: new Date().toISOString(),
              options: { ...consentOptions, passiveMicroChecks: false },
              status: 'declined',
            });
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={64} color="#007AFF" />
          <Text style={styles.title}>Welcome to Wellness Portal</Text>
          <Text style={styles.subtitle}>
            Let's set up your privacy preferences
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>How It Works</Text>
          <Text style={styles.summaryText}>
            We run short, private wellness checks during attendance to offer
            helpful resources. No photos are stored unless you allow it.
          </Text>

          <View style={styles.bulletPoints}>
            <BulletPoint
              icon="lock-closed"
              text="All processing happens on your device"
            />
            <BulletPoint
              icon="eye-off"
              text="No images saved or uploaded"
            />
            <BulletPoint
              icon="shield"
              text="Encrypted and anonymous data"
            />
            <BulletPoint
              icon="person"
              text="You control your privacy settings"
            />
          </View>
        </View>

        <View style={styles.toggleSection}>
          <Text style={styles.sectionTitle}>Your Privacy Controls</Text>

          <ToggleOption
            icon="pulse"
            title="Passive Wellness Checks"
            description="Brief emotion check during attendance (2-3 seconds)"
            value={consentOptions.passiveMicroChecks}
            onValueChange={(value) =>
              setConsentOptions({ ...consentOptions, passiveMicroChecks: value })
            }
            recommended
          />

          <ToggleOption
            icon="camera"
            title="Save Raw Snapshots"
            description="Keep photos for 7 days (helps improve accuracy)"
            value={consentOptions.saveRawSnapshots}
            onValueChange={(value) =>
              setConsentOptions({ ...consentOptions, saveRawSnapshots: value })
            }
          />

          <ToggleOption
            icon="school"
            title="Help Improve AI"
            description="Send corrections to train better models (anonymous)"
            value={consentOptions.sendCorrections}
            onValueChange={(value) =>
              setConsentOptions({ ...consentOptions, sendCorrections: value })
            }
          />
        </View>

        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandButtonText}>
            Read Detailed Privacy Policy
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#007AFF"
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.detailedPolicy}>
            <Text style={styles.policyText}>
              <Text style={styles.policyBold}>Data Collection:{'\n'}</Text>
              We collect facial feature embeddings (mathematical representations)
              during attendance, not actual photos. These embeddings cannot be
              reversed to recreate your image.
              {'\n\n'}
              <Text style={styles.policyBold}>Data Usage:{'\n'}</Text>
              Your wellness data is used to provide personalized mental health
              support. Only anonymized data (with no identifying information) is
              used for analytics.
              {'\n\n'}
              <Text style={styles.policyBold}>Identity Protection:{'\n'}</Text>
              Your name is only revealed to counselors in critical situations
              (severe distress, mandatory screening not completed). All such
              actions are logged and auditable.
              {'\n\n'}
              <Text style={styles.policyBold}>Your Rights:{'\n'}</Text>
              You can withdraw consent, export your data, or request deletion at
              any time through Settings.
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleAcceptAndCalibrate}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>
              Accept & Calibrate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDecline}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              Decline - Manual Check-in
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </View>
  );
}

function BulletPoint({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.bulletPoint}>
      <Ionicons name={icon as any} size={20} color="#34C759" />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function ToggleOption({
  icon,
  title,
  description,
  value,
  onValueChange,
  recommended,
}: {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  recommended?: boolean;
}) {
  return (
    <View style={styles.toggleOption}>
      <View style={styles.toggleLeft}>
        <View style={styles.toggleIcon}>
          <Ionicons name={icon as any} size={24} color="#007AFF" />
        </View>
        <View style={styles.toggleInfo}>
          <View style={styles.toggleTitleRow}>
            <Text style={styles.toggleTitle}>{title}</Text>
            {recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
          </View>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d1d6', true: '#34C759' }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletPoints: {
    gap: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  toggleSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  toggleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  toggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  recommendedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34C759',
  },
  toggleDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 16,
  },
  expandButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  detailedPolicy: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  policyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  policyBold: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  footer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
