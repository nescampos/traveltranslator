import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, Copy, Sparkles } from 'lucide-react-native';
import { Translation } from '@/types/translation';
import { getLanguageName } from '@/constants/languages';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ElevenLabsService } from '@/services/elevenLabsService';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';

interface TranslationCardProps {
  translation: Translation;
  onSpeak?: () => void;
}

export function TranslationCard({ translation, onSpeak }: TranslationCardProps) {
  const elevenLabsService = ElevenLabsService.getInstance();

  const handleFallbackSpeak = async () => {
    try {
      await Speech.speak(translation.translatedText, {
        language: translation.targetLanguage,
        rate: 0.8,
      });
      onSpeak?.();
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(translation.translatedText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.languageInfo}>
          <Text style={styles.languageText}>
            {getLanguageName(translation.originalLanguage)} → {getLanguageName(translation.targetLanguage)}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(translation.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Copy size={18} color="#6b7280" />
          </TouchableOpacity>
          
          {elevenLabsService.isConfigured() ? (
            <View style={styles.aiAudioContainer}>
              <AudioPlayer
                text={translation.translatedText}
                language={translation.targetLanguage}
                size="small"
                variant="secondary"
              />
            </View>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={handleFallbackSpeak}>
              <Volume2 size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.label}>Original</Text>
          <Text style={styles.originalText}>{translation.originalText}</Text>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.textSection}>
          <Text style={styles.label}>Translation</Text>
          <Text style={styles.translatedText}>{translation.translatedText}</Text>
        </View>
      </View>

      {elevenLabsService.isConfigured() && (
        <View style={styles.enhancementBadge}>
          <Sparkles size={10} color="#8b5cf6" />
          <Text style={styles.enhancementText}>AI Voice Available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563eb',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  aiAudioContainer: {
    backgroundColor: '#faf5ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  content: {
    gap: 16,
  },
  textSection: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
  translatedText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    lineHeight: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  enhancementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    gap: 4,
  },
  enhancementText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#8b5cf6',
  },
});