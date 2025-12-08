import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Activity {
  id: string;
  title: string;
  category: 'completed' | 'pending' | 'suggestion';
  icon: string;
  color: string;
}

const ACTIVITIES: Activity[] = [
  // Completed Tasks
  {
    id: '1',
    title: 'Morning Meditation',
    category: 'completed',
    icon: 'checkmark-circle',
    color: '#10B981',
  },
  {
    id: '2',
    title: 'Mandatory Assessment',
    category: 'completed',
    icon: 'checkmark-circle',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Mood Tracking',
    category: 'completed',
    icon: 'checkmark-circle',
    color: '#10B981',
  },
  // Pending Tasks
  {
    id: '4',
    title: 'Breathing Exercise',
    category: 'pending',
    icon: 'timer-outline',
    color: '#3B82F6',
  },
  {
    id: '5',
    title: 'Journal Entry',
    category: 'pending',
    icon: 'document-text-outline',
    color: '#3B82F6',
  },
  // AI Suggestions
  {
    id: '6',
    title: 'Deep Sleep Tips',
    category: 'suggestion',
    icon: 'lightbulb-outline',
    color: '#F59E0B',
  },
  {
    id: '7',
    title: 'Connect with Friends',
    category: 'suggestion',
    icon: 'people-outline',
    color: '#F59E0B',
  },
];

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getBackgroundColor = () => {
    switch (activity.category) {
      case 'completed':
        return '#ECFDF5';
      case 'pending':
        return '#EFF6FF';
      case 'suggestion':
        return '#FFFBEB';
      default:
        return '#F8F9FA';
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <View style={[
        styles.activityCard,
        { backgroundColor: getBackgroundColor() },
      ]}>
        <View style={styles.activityContent}>
          <View style={[styles.iconContainer, { backgroundColor: activity.color }]}>
            <Ionicons name={activity.icon as any} size={20} color="#fff" />
          </View>
          <Text style={styles.activityTitle}>{activity.title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function MyActivityScreen() {
  const router = useRouter();

  const completedActivities = ACTIVITIES.filter(a => a.category === 'completed');
  const pendingActivities = ACTIVITIES.filter(a => a.category === 'pending');
  const suggestions = ACTIVITIES.filter(a => a.category === 'suggestion');

  const totalTasks = ACTIVITIES.filter(a => a.category !== 'suggestion').length;
  const completedCount = completedActivities.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#0F1724" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Activity</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressValue}>{completionPercentage}%</Text>
          </View>
          
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${completionPercentage}%` },
              ]}
            />
          </View>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pendingActivities.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>
        {/* Completed Tasks */}
        {completedActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Completed</Text>
            {completedActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </View>
        )}

        {/* Pending Tasks */}
        {pendingActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏳ To Do</Text>
            {pendingActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </View>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Tips for You</Text>
            {suggestions.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </View>
        )}

        <View style={styles.spacerBottom} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1724',
  },
  spacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  progressSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  progressValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F1724',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1724',
    marginBottom: 10,
  },
  activityCard: {
    marginBottom: 10,
    borderRadius: 12,
    padding: 12,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1724',
    flex: 1,
  },
  spacerBottom: {
    height: 20,
  },
});
