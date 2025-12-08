import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import apiService from '../../services/api';

type ScreeningType = 'PHQ9' | 'GAD7';

interface Question {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

const PHQ9_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Little interest or pleasure in doing things',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q2',
    text: 'Feeling down, depressed, or hopeless',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q3',
    text: 'Trouble falling or staying asleep',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q4',
    text: 'Feeling tired or having little energy',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q5',
    text: 'Poor appetite or overeating',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q6',
    text: 'Feeling bad about yourself',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q7',
    text: 'Trouble concentrating on things',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q8',
    text: 'Moving or speaking too slowly or too fast',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'q9',
    text: 'Thoughts that you would be better off dead',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
];

export default function ScreeningModal({
  type = 'PHQ9',
  onClose,
  onComplete,
}: {
  type?: ScreeningType;
  onClose: () => void;
  onComplete?: (result: any) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const questions = PHQ9_QUESTIONS;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const riskLevel = calculateRiskLevel(score, type);

      await apiService.submitScreening({
        questionnaire: type,
        answers,
        score,
        riskLevel,
        timestamp: new Date().toISOString(),
      });

      setResult({
        score,
        riskLevel,
        interpretation: getInterpretation(score, type),
        recommendations: getRecommendations(riskLevel),
      });
      setShowResult(true);

      if (riskLevel === 'high' || riskLevel === 'severe') {
        await apiService.createCase({
          reason: `${type} screening: ${riskLevel} risk`,
          score,
        });
      }
    } catch (error) {
      console.error('Screening submission error:', error);
      Alert.alert('Error', 'Failed to submit screening. Please try again.');
    }
  };

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ.id] !== undefined;

  if (showResult && result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: getRiskColor(result.riskLevel) }]}>
            <Ionicons
              name={getRiskIcon(result.riskLevel)}
              size={64}
              color="#fff"
            />
          </View>

          <Text style={styles.resultTitle}>Screening Complete</Text>
          <Text style={styles.resultScore}>Score: {result.score}</Text>
          <Text style={styles.resultLevel}>{result.interpretation}</Text>

          <View style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
            {result.recommendations.map((rec: string, idx: number) => (
              <View key={idx} style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          {(result.riskLevel === 'high' || result.riskLevel === 'severe') && (
            <View style={styles.emergencyCard}>
              <Ionicons name="warning" size={24} color="#FF3B30" />
              <Text style={styles.emergencyText}>
                A counselor will be notified and will contact you within 24 hours.
              </Text>
              <TouchableOpacity style={styles.emergencyButton}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.emergencyButtonText}>Call Helpline Now</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.doneButton}
            onPress={async () => {
              try {
                const tokens = await apiService.getStoredAuthTokens();
                const userId = tokens?.user?.userId || 'anonymous';
                
                const { error } = await supabase.from('form_result').insert({
                  userId: userId,
                  score: result.score,
                });

                if (error) {
                  console.error('Supabase submission error:', error);
                }
              } catch (err) {
                console.error('Failed to submit screening result:', err);
              }
              
              onComplete?.(result);
              if (onClose) {
                onClose();
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
            if (onClose) {
                onClose();
            } else {
                router.back();
            }
        }}>
          <Ionicons name="close" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>PHQ-9 Screening</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentQuestion + 1} of {totalQuestions}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.content}>
        {currentQuestion === 0 && (
          <View style={styles.introCard}>
            <Ionicons name="clipboard" size={48} color="#007AFF" />
            <Text style={styles.introTitle}>Quick Check-In</Text>
            <Text style={styles.introText}>
              Over the last 2 weeks, how often have you been bothered by problems?
            </Text>
            <Text style={styles.introNote}>
              This screening is confidential and takes about 2-3 minutes.
            </Text>
          </View>
        )}

        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
          <Text style={styles.questionText}>{currentQ.text}</Text>

          <View style={styles.optionsContainer}>
            {currentQ.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  answers[currentQ.id] === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleAnswer(currentQ.id, option.value)}
              >
                <View style={styles.optionRadio}>
                  {answers[currentQ.id] === option.value && (
                    <View style={styles.optionRadioSelected} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    answers[currentQ.id] === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.privacyNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
          <Text style={styles.privacyText}>
            Your responses are encrypted and confidential
          </Text>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.nextButton, !isAnswered && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isAnswered}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === totalQuestions - 1 ? 'Submit' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function calculateRiskLevel(score: number, type: ScreeningType): string {
  if (type === 'PHQ9') {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderately-severe';
    return 'severe';
  }
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  return 'severe';
}

function getInterpretation(score: number, type: ScreeningType): string {
  const level = calculateRiskLevel(score, type);
  const interpretations: Record<string, string> = {
    minimal: 'Minimal symptoms - You\'re doing well',
    mild: 'Mild symptoms - Some support may help',
    moderate: 'Moderate symptoms - Professional support recommended',
    'moderately-severe': 'Moderately severe symptoms - Professional help needed',
    severe: 'Severe symptoms - Urgent professional help needed',
  };
  return interpretations[level] || '';
}

function getRecommendations(riskLevel: string): string[] {
  const recommendations: Record<string, string[]> = {
    minimal: [
      'Continue wellness practices',
      'Use resources when needed',
      'Check in regularly',
    ],
    mild: [
      'Try guided relaxation',
      'Maintain healthy habits',
      'Stay connected',
    ],
    moderate: [
      'Schedule counselor appointment',
      'Use daily resources',
      'Monitor symptoms',
    ],
    'moderately-severe': [
      'Speak with counselor soon',
      'Avoid isolation',
      'Follow up within one week',
    ],
    severe: [
      'Contact counselor immediately',
      'Reach out to support',
      'Use crisis resources',
    ],
  };
  return recommendations[riskLevel] || [];
}

function getRiskColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    minimal: '#34C759',
    mild: '#34C759',
    moderate: '#FF9500',
    'moderately-severe': '#FF9500',
    severe: '#FF3B30',
  };
  return colors[riskLevel] || '#999';
}

function getRiskIcon(riskLevel: string): any {
  if (riskLevel === 'minimal' || riskLevel === 'mild') return 'checkmark-circle';
  if (riskLevel === 'moderate' || riskLevel === 'moderately-severe') return 'warning';
  return 'alert-circle';
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  placeholder: {
    width: 28,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  introNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  privacyText: {
    fontSize: 13,
    color: '#666',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  resultLevel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 32,
  },
  recommendationsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  emergencyCard: {
    width: '100%',
    backgroundColor: '#FFF3F3',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  emergencyText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
