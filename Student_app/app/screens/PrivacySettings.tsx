import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import apiService from '../../services/api';

interface ConsentSettings {
  passiveChecks: boolean;
  saveRawSnapshots: boolean;
  sendCorrections: boolean;
  autoDeleteDays: number;
}

interface ConsentHistory {
  id: string;
  action: string;
  timestamp: Date;
  details: string;
}

export default function PrivacySettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<ConsentSettings>({
    passiveChecks: true,
    saveRawSnapshots: false,
    sendCorrections: false,
    autoDeleteDays: 7,
  });
  const [consentHistory, setConsentHistory] = useState<ConsentHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadConsentHistory();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await apiService.getStoredConsent();
      if (stored && stored.options) {
        setSettings({
          passiveChecks: stored.options.passiveMicroChecks ?? true,
          saveRawSnapshots: stored.options.saveRawSnapshots ?? false,
          sendCorrections: stored.options.sendCorrections ?? false,
          autoDeleteDays: stored.options.autoDeleteDays ?? 7,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadConsentHistory = async () => {
    try {
      const history = await apiService.getConsentHistory();
      setConsentHistory(history);
    } catch (error) {
      console.error('Failed to load consent history:', error);
    }
  };

  const handleToggle = async (key: keyof ConsentSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await apiService.updateConsent({
        [key]: value,
        timestamp: new Date().toISOString(),
      });

      if (key === 'passiveChecks' && !value) {
        Alert.alert(
          'Monitoring Disabled',
          'Passive wellness checks are now off.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting.');
      setSettings(settings);
    }
  };

  const handleWithdrawConsent = () => {
    setShowWithdrawConfirm(true);
  };

  const confirmWithdrawConsent = async () => {
    setShowWithdrawConfirm(false);
    setLoading(true);

    try {
      await apiService.withdrawConsent();
      Alert.alert(
        'Consent Withdrawn',
        'Your consent has been withdrawn. You will now use manual check-in mode.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to withdraw consent.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your data. This cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAccount();
              Alert.alert('Account Deleted', 'Your account has been deleted.');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Ionicons
              name={settings.passiveChecks ? 'shield-checkmark' : 'shield-outline'}
              size={48}
              color={settings.passiveChecks ? '#34C759' : '#FF9500'}
            />
          </View>
          <Text style={styles.statusTitle}>
            {settings.passiveChecks ? 'Monitoring Active' : 'Manual Mode'}
          </Text>
          <Text style={styles.statusDescription}>
            {settings.passiveChecks
              ? 'Wellness checks are running'
              : 'Manual check-in mode enabled'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>

          <SettingToggle
            icon="pulse"
            title="Passive Wellness Checks"
            description="Brief emotion check during attendance"
            value={settings.passiveChecks}
            onValueChange={(value) => handleToggle('passiveChecks', value)}
            highlighted
          />

          <SettingToggle
            icon="camera"
            title="Save Snapshots"
            description="Keep photos temporarily for accuracy"
            value={settings.saveRawSnapshots}
            onValueChange={(value) => handleToggle('saveRawSnapshots', value)}
          />

          <SettingToggle
            icon="school"
            title="Share Corrections"
            description="Help improve AI with feedback (anonymous)"
            value={settings.sendCorrections}
            onValueChange={(value) => handleToggle('sendCorrections', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <ActionButton
            icon="download-outline"
            title="Export My Data"
            description="Download your wellness data"
            onPress={() => Alert.alert('Export', 'Exporting data...')}
          />

          <ActionButton
            icon="document-text-outline"
            title="Privacy Policy"
            description="Read our full privacy policy"
            onPress={() => Alert.alert('Privacy', 'Opening privacy policy...')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

          <ActionButton
            icon="exit-outline"
            title="Withdraw Consent"
            description="Stop passive monitoring"
            onPress={handleWithdrawConsent}
            danger
          />

          <ActionButton
            icon="trash-outline"
            title="Delete Account"
            description="Permanently delete all data"
            onPress={handleDeleteAccount}
            danger
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All actions are logged for security. Contact support@university.edu for questions.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showWithdrawConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowWithdrawConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Ionicons name="warning" size={64} color="#FF9500" />
            <Text style={styles.confirmTitle}>Withdraw Consent?</Text>
            <Text style={styles.confirmDescription}>
              This will disable passive wellness checks. You can re-enable anytime.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmWithdrawConsent}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Processing...' : 'Withdraw'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowWithdrawConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingToggle({
  icon,
  title,
  description,
  value,
  onValueChange,
  highlighted,
}: {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  highlighted?: boolean;
}) {
  return (
    <View style={[styles.settingCard, highlighted && styles.settingCardHighlighted]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
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

function ActionButton({
  icon,
  title,
  description,
  onPress,
  danger,
}: {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, danger && styles.actionButtonDanger]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon as any}
          size={24}
          color={danger ? '#FF3B30' : '#007AFF'}
        />
      </View>
      <View style={styles.actionInfo}>
        <Text style={[styles.actionTitle, danger && styles.actionTitleDanger]}>
          {title}
        </Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },
  statusIconContainer: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  dangerTitle: {
    color: '#FF3B30',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  settingCardHighlighted: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  actionButtonDanger: {
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionTitleDanger: {
    color: '#FF3B30',
  },
  actionDescription: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 12,
  },
  confirmDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  confirmButtons: {
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
