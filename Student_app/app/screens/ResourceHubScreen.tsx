// app/screens/ResourceHubScreen.tsx
// Resource Hub - Dedicated full-screen resource library
// SPEC: ResourceHubScreen - Calming, sleep, focus, study audio/video library

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// SPEC: i18n_keys_required
const i18n = {
  en: {
    'resources.title': 'Resource Hub',
    'resources.search.placeholder': 'Search resources...',
    'resources.categories': 'Categories',
    'resources.all': 'All',
    'resources.calming': 'Calming',
    'resources.sleep': 'Sleep',
    'resources.focus': 'Focus',
    'resources.study': 'Study',
    'resources.featured': 'Featured Playlists',
    'resources.duration': 'Duration',
    'resources.language': 'Language',
    'resources.download': 'Download for offline',
    'resources.back': 'Back',
  },
  hi: {
    'resources.title': 'रिसोर्स हब',
    'resources.search.placeholder': 'संसाधन खोजें...',
    'resources.categories': 'श्रेणियाँ',
    'resources.all': 'सभी',
    'resources.calming': 'शांति',
    'resources.sleep': 'नींद',
    'resources.focus': 'ध्यान',
    'resources.study': 'अध्ययन',
    'resources.featured': 'विशेष प्लेलिस्ट',
    'resources.duration': 'अवधि',
    'resources.language': 'भाषा',
    'resources.download': 'ऑफलाइन के लिए डाउनलोड करें',
    'resources.back': 'वापस',
  },
};

interface Resource {
  id: string;
  title: string;
  category: 'calming' | 'sleep' | 'focus' | 'study';
  duration: string;
  language: string;
  thumbnail?: string;
  artist?: string;
}

const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Peaceful Rain Sounds',
    category: 'calming',
    duration: '45 min',
    language: 'English',
    artist: 'Nature Ambiance',
  },
  {
    id: '2',
    title: 'Deep Sleep Meditation',
    category: 'sleep',
    duration: '30 min',
    language: 'English',
    artist: 'Sleep Guide',
  },
  {
    id: '3',
    title: 'Focus Flow Music',
    category: 'focus',
    duration: '60 min',
    language: 'English',
    artist: 'Study Music',
  },
  {
    id: '4',
    title: 'Exam Preparation Vibes',
    category: 'study',
    duration: '50 min',
    language: 'English',
    artist: 'Study Master',
  },
];

export default function ResourceHubScreen() {
  const router = useRouter();
  const [locale, setLocale] = useState<'en' | 'hi'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'calming' | 'sleep' | 'focus' | 'study'>('all');
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const t = (key: string): string => {
    return (i18n[locale] as Record<string, string>)[key] || key;
  };

  const filteredResources = useMemo(() => {
    let filtered = MOCK_RESOURCES;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const toggleDownload = (id: string) => {
    const newSet = new Set(downloadedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setDownloadedIds(newSet);
  };

  const renderResourceCard = ({ item }: { item: Resource }) => (
    <TouchableOpacity
      testID="resource_search"
      style={styles.resourceCard}
      activeOpacity={0.7}
    >
      <View style={styles.resourceThumbnail}>
        <Ionicons
          name={
            item.category === 'calming'
              ? 'leaf'
              : item.category === 'sleep'
              ? 'moon'
              : item.category === 'focus'
              ? 'flash'
              : 'book'
          }
          size={40}
          color="#007AFF"
        />
      </View>

      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceArtist}>{item.artist}</Text>
        <View style={styles.resourceMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={12} color="#999" />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="language" size={12} color="#999" />
            <Text style={styles.metaText}>{item.language}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => toggleDownload(item.id)}
      >
        <Ionicons
          name={downloadedIds.has(item.id) ? 'download' : 'download-outline'}
          size={24}
          color={downloadedIds.has(item.id) ? '#34C759' : '#007AFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View testID="resources_screen" style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>{t('resources.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('resources.search.placeholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#CCC"
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {(['all', 'calming', 'sleep', 'focus', 'study'] as const).map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {t(`resources.${cat}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resources List */}
      <FlatList
        data={filteredResources}
        renderItem={renderResourceCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4E8',
  },
  headerLeft: {
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F1724',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E4E8',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E4E8',
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  resourceThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F1724',
    marginBottom: 4,
  },
  resourceArtist: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  downloadButton: {
    padding: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
