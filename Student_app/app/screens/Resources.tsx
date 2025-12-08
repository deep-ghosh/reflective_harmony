 import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Resource {
  id: string;
  title: string;
  category: string;
  duration: string;
  language: string;
  tags: string[];
  type: 'video' | 'audio' | 'article' | 'neuromodulation';
}

const RESOURCES: Resource[] = [
  {
    id: '1',
    title: '5-Minute Breathing Exercise',
    category: 'Calm',
    duration: '5 min',
    language: 'en',
    tags: ['anxiety', 'stress'],
    type: 'audio',
  },
  {
    id: '2',
    title: 'Progressive Muscle Relaxation',
    category: 'Calm',
    duration: '10 min',
    language: 'en',
    tags: ['tension', 'relaxation'],
    type: 'audio',
  },
  {
    id: '3',
    title: 'Focus Enhancement Session',
    category: 'Focus',
    duration: '15 min',
    language: 'en',
    tags: ['concentration', 'productivity'],
    type: 'neuromodulation',
  },
  {
    id: '4',
    title: 'Sleep Preparation Routine',
    category: 'Sleep',
    duration: '20 min',
    language: 'en',
    tags: ['insomnia', 'sleep'],
    type: 'audio',
  },
];

export default function Resources() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const categories = ['All', 'Calm', 'Focus', 'Sleep'];

  const filteredResources = RESOURCES.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness Resources</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.resourcesList}>
        {filteredResources.map((resource) => (
          <TouchableOpacity
            key={resource.id}
            style={styles.resourceCard}
            onPress={() => setSelectedResource(resource)}
          >
            <View style={styles.resourceIconContainer}>
              <Ionicons
                name={getResourceIcon(resource.type)}
                size={32}
                color={getResourceColor(resource.category)}
              />
            </View>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <View style={styles.resourceMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>{resource.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>{resource.category}</Text>
                </View>
              </View>
              <View style={styles.tagContainer}>
                {resource.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}

        {filteredResources.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No resources found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={selectedResource !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedResource(null)}
      >
        {selectedResource && (
          <ResourceDetail
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
          />
        )}
      </Modal>
    </View>
  );
}

function ResourceDetail({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return 100;
        }
        return prev + 1;
      });
    }, 200);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={28} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.detailContent}>
        <View style={styles.detailIconLarge}>
          <Ionicons
            name={getResourceIcon(resource.type)}
            size={64}
            color={getResourceColor(resource.category)}
          />
        </View>

        <Text style={styles.detailTitle}>{resource.title}</Text>
        <Text style={styles.detailCategory}>{resource.category}</Text>

        <View style={styles.detailMeta}>
          <View style={styles.detailMetaItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.detailMetaText}>{resource.duration}</Text>
          </View>
          <View style={styles.detailMetaItem}>
            <Ionicons name="language-outline" size={20} color="#666" />
            <Text style={styles.detailMetaText}>English</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>What to Expect</Text>
          <Text style={styles.detailDescription}>
            This {resource.type} session is designed to help with {resource.tags.join(', ')}.
            Find a quiet space, use headphones for best results, and allow yourself
            to relax fully during the session.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.detailFooter}>
        {!isPlaying ? (
          <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
            <Ionicons name="play" size={28} color="#fff" />
            <Text style={styles.playButtonText}>Start Session</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{progress}% Complete</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

function getResourceIcon(type: string): any {
  const icons: Record<string, any> = {
    video: 'play-circle',
    audio: 'musical-notes',
    article: 'document-text',
    neuromodulation: 'pulse',
  };
  return icons[type] || 'document';
}

function getResourceColor(category: string): string {
  const colors: Record<string, string> = {
    Calm: '#34C759',
    Focus: '#007AFF',
    Sleep: '#5856D6',
  };
  return colors[category] || '#999';
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  resourcesList: {
    flex: 1,
    padding: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  resourceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  resourceMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailHeader: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailContent: {
    flex: 1,
    padding: 24,
  },
  detailIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailCategory: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 32,
  },
  detailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailMetaText: {
    fontSize: 15,
    color: '#666',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  detailFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  progressInfo: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
