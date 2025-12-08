import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChatMessage {
  id: string;
  message: string;
  timestamp: string;
  userHandle: string;
  isOwn: boolean;
  replyTo?: string;
  replyToHandle?: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    message: 'Did you see what happened at the football game yesterday? 👀',
    timestamp: '2:15 PM',
    userHandle: 'Anon User #8392',
    isOwn: false,
  },
  {
    id: '2',
    message: 'No! What happened? Spill the tea ☕',
    timestamp: '2:18 PM',
    userHandle: 'Anon User #5621',
    isOwn: false,
  },
  {
    id: '3',
    message: 'Our QB got benched after that terrible pass. Rumor is he\'s been skipping practices',
    timestamp: '2:20 PM',
    userHandle: 'Anon User #8392',
    isOwn: false,
  },
  {
    id: '4',
    message: 'Noooo, that\'s wild! I heard he was dating someone from the cheer squad 😱',
    timestamp: '2:22 PM',
    userHandle: 'Anon User #7245',
    isOwn: false,
  },
  {
    id: '5',
    message: 'Wait really? That explains why he\'s been distracted',
    timestamp: '2:25 PM',
    userHandle: 'Anon User #4918',
    isOwn: false,
  },
  {
    id: '6',
    message: 'Also heard the dean is planning something big for homecoming week 👀',
    timestamp: '2:28 PM',
    userHandle: 'Anon User #6734',
    isOwn: false,
  },
  {
    id: '7',
    message: 'Ohhh what is it?? I need to know everything lol',
    timestamp: '2:30 PM',
    userHandle: 'Anon User #5621',
    isOwn: false,
  },
  {
    id: '8',
    message: 'No one knows yet but I heard they\'re bringing in a famous artist to perform 🎤',
    timestamp: '2:33 PM',
    userHandle: 'Anon User #6734',
    isOwn: false,
  },
  {
    id: '9',
    message: 'Stop it!! This is too good. Can\'t wait for homecoming now 🔥',
    timestamp: '2:35 PM',
    userHandle: 'Anon User #8392',
    isOwn: false,
  },
];

const ChatMessage: React.FC<{ 
  message: ChatMessage;
  onReply: (message: ChatMessage) => void;
  onDelete: (id: string) => void;
}> = ({ message, onReply, onDelete }) => {
  const panX = useRef(new Animated.Value(0)).current;
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, { dx }) => {
        if (!message.isOwn && dx < 0) {
          panX.setValue(Math.max(dx, -100));
        }
      },
      onPanResponderRelease: (evt, { dx }) => {
        if (!message.isOwn && dx < -50) {
          onReply(message);
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={[
      styles.messageContainer,
      message.isOwn && styles.ownMessageContainer,
    ]}>
      {/* Message Bubble */}
      <Animated.View
        {...(message.isOwn ? {} : panResponder.panHandlers)}
        style={[
          styles.messageBubbleWrapper,
          !message.isOwn && { transform: [{ translateX: panX }] },
        ]}
      >
        <TouchableOpacity
          onLongPress={() => setShowDeleteMenu(!showDeleteMenu)}
          delayLongPress={200}
          style={styles.messageBubbleTouchable}
        >
          <View
            style={[
              styles.messageBubble,
              message.isOwn
                ? styles.ownMessageBubble
                : styles.otherMessageBubble,
            ]}
          >
            {/* Reply To Section */}
            {message.replyTo && (
              <View style={[
                styles.replyBox,
                message.isOwn ? styles.replyBoxOwn : styles.replyBoxOther,
              ]}>
                <Text style={[
                  styles.replyToHandle,
                  message.isOwn && styles.replyToHandleOwn,
                ]}>
                  ↳ {message.replyToHandle}
                </Text>
                <Text style={[
                  styles.replyToText,
                  message.isOwn && styles.replyToTextOwn,
                ]} numberOfLines={1}>
                  {message.replyTo}
                </Text>
              </View>
            )}

            {/* Message Header */}
            {!message.isOwn && (
              <Text style={styles.messageHandle}>{message.userHandle}</Text>
            )}

            {/* Message Text */}
            <Text
              style={[
                styles.messageText,
                message.isOwn && styles.ownMessageText,
              ]}
            >
              {message.message}
            </Text>

            {/* Message Footer */}
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  message.isOwn && styles.ownMessageTime,
                ]}
              >
                {message.timestamp}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Delete Menu (for own messages) */}
      {showDeleteMenu && message.isOwn && (
        <View style={styles.deleteMenu}>
          <TouchableOpacity
            style={styles.deleteMenuButton}
            onPress={() => {
              onDelete(message.id);
              setShowDeleteMenu(false);
            }}
          >
            <Ionicons name="trash" size={18} color="#EF4444" />
            <Text style={styles.deleteMenuText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function AnonymousUserAnalyticsScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputText,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      userHandle: `Anon User #${Math.floor(Math.random() * 9000) + 1000}`,
      isOwn: true,
      replyTo: replyingTo?.message,
      replyToHandle: replyingTo?.userHandle,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setReplyingTo(null);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id));
  };

  const handleReplyMessage = (message: ChatMessage) => {
    setReplyingTo(message);
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#0F1724" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Group 🔥</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
      >
        {/* Chat Messages */}
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <ChatMessage 
              message={item}
              onReply={handleReplyMessage}
              onDelete={handleDeleteMessage}
            />
          )}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Reply To Section */}
        {replyingTo && (
          <View style={styles.replyPreview}>
            <View>
              <Text style={styles.replyPreviewLabel}>Replying to {replyingTo.userHandle}</Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyingTo.message}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          </View>
        )}

        {/* Chat Input */}
        <View style={styles.chatInputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Share the tea ☕"
              placeholderTextColor="#A0AEC0"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#fff' : '#A0AEC0'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.privacyNote}>
            🔐 Stay anonymous • Be respectful • No hate speech
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1724',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A2332',
    borderBottomWidth: 1,
    borderBottomColor: '#2D3E52',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  spacer: {
    width: 44,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  otherMessageBubble: {
    backgroundColor: '#2D3E52',
    borderColor: '#3D4E62',
  },
  ownMessageBubble: {
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
  },
  messageHandle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0AEC0',
    marginBottom: 4,
    marginLeft: 4,
  },
  ownMessageHandle: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    fontWeight: '500',
  },
  ownMessageText: {
    color: '#fff',
  },
  messageFooter: {
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#718096',
    marginTop: 6,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  replyBox: {
    paddingBottom: 8,
    marginBottom: 8,
    borderLeftWidth: 2,
    paddingLeft: 8,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
  },
  replyBoxOwn: {
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  replyBoxOther: {
    borderLeftColor: '#6366F1',
  },
  replyToHandle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 2,
  },
  replyToHandleOwn: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  replyToText: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
  },
  replyToTextOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  actionButtonsOwn: {
    justifyContent: 'flex-end',
  },
  actionButtonsOther: {
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  deleteButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  messageActionArea: {
    padding: 8,
  },
  messageBubbleWrapper: {
    flex: 1,
  },
  messageBubbleTouchable: {
    flex: 1,
  },
  deleteMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#1A2332',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D3E52',
    minWidth: 120,
  },
  deleteMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  deleteMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A2332',
    borderTopWidth: 1,
    borderTopColor: '#2D3E52',
    gap: 12,
    flex: 1,
  },
  replyPreviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  replyPreviewText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontStyle: 'italic',
  },
  chatInputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1A2332',
    borderTopWidth: 1,
    borderTopColor: '#2D3E52',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2D3E52',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#E2E8F0',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#3D4E62',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#3D4E62',
  },
  privacyNote: {
    fontSize: 10,
    color: '#718096',
    marginTop: 8,
    fontWeight: '500',
  },
});
