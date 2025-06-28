import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { RotateCcw, Send, Volume2, Sparkles, ExternalLink, Settings } from 'lucide-react-native';
import { LanguageSelector } from '@/components/LanguageSelector';
import { RecordingButton } from '@/components/RecordingButton';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TranslationService } from '@/services/translationService';
import { StorageService } from '@/services/storageService';
import { ElevenLabsService } from '@/services/elevenLabsService';
import { Translation } from '@/types/translation';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';

export default function TranslateScreen() {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAPIKeyPrompt, setShowAPIKeyPrompt] = useState(false);

  const translationService = TranslationService.getInstance();
  const storageService = StorageService.getInstance();
  const elevenLabsService = ElevenLabsService.getInstance();

  useEffect(() => {
    loadSettings();
    checkAPIConfiguration();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await storageService.getSettings();
      setSourceLanguage(settings.defaultSourceLanguage);
      setTargetLanguage(settings.defaultTargetLanguage);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkAPIConfiguration = async () => {
    const envConfigured = translationService.isEnvironmentConfigured();
    const userConfigured = await translationService.isUserConfigured();
    
    if (!envConfigured && !userConfigured) {
      setShowAPIKeyPrompt(true);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translationService.translateText({
        text: inputText.trim(),
        fromLanguage: sourceLanguage,
        toLanguage: targetLanguage,
      });

      setTranslatedText(result.translatedText);

      // Save to history
      const translation: Translation = {
        id: Date.now().toString(),
        originalText: result.originalText,
        translatedText: result.translatedText,
        originalLanguage: result.fromLanguage,
        targetLanguage: result.toLanguage,
        timestamp: Date.now(),
        isAudio: false,
      };

      await storageService.saveTranslation(translation);

      // Auto-speak if enabled and ElevenLabs is not configured
      const settings = await storageService.getSettings();
      if (settings.autoSpeak && !elevenLabsService.isConfigured()) {
        handleFallbackSpeak();
      }
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert('Error', 'Failed to translate text. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Swap texts if both exist
    if (inputText && translatedText) {
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const handleFallbackSpeak = async () => {
    if (translatedText) {
      try {
        await Speech.speak(translatedText, {
          language: targetLanguage,
          rate: 0.8,
        });
      } catch (error) {
        console.error('Speech error:', error);
      }
    }
  };

  const handleRecord = () => {
    // Simulate recording functionality
    // In a real app, you would implement audio recording here
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setIsRecording(false);
        setInputText('Hello, how are you today?');
      }, 3000);
    }
  };

  const clearAll = () => {
    setInputText('');
    setTranslatedText('');
  };

  const handleBoltPress = () => {
    if (Platform.OS === 'web') {
      window.open('https://bolt.new', '_blank');
    } else {
      Linking.openURL('https://bolt.new');
    }
  };

  const handleGoToSettings = () => {
    router.push('/(tabs)/settings');
  };

  const dismissAPIKeyPrompt = () => {
    setShowAPIKeyPrompt(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Travel Translator</Text>
              <Text style={styles.subtitle}>Speak with confidence anywhere</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.boltBadge}
              onPress={handleBoltPress}
              activeOpacity={0.8}
            >
              <View style={styles.boltContent}>
                <View style={styles.boltIcon}>
                  <Text style={styles.boltEmoji}>⚡</Text>
                </View>
                <View style={styles.boltText}>
                  <Text style={styles.boltLabel}>Built with</Text>
                  <Text style={styles.boltName}>Bolt.new</Text>
                </View>
                <ExternalLink size={14} color="#6366f1" />
              </View>
            </TouchableOpacity>
          </View>

          {showAPIKeyPrompt && (
            <View style={styles.apiPrompt}>
              <View style={styles.apiPromptContent}>
                <Text style={styles.apiPromptTitle}>🚀 Get Started with AI Translations</Text>
                <Text style={styles.apiPromptDescription}>
                  To unlock advanced AI translations, add your OpenAI API key in settings. 
                  Without it, you'll see demo translations only.
                </Text>
                <View style={styles.apiPromptActions}>
                  <TouchableOpacity 
                    style={styles.apiPromptButton}
                    onPress={handleGoToSettings}
                  >
                    <Settings size={16} color="#ffffff" />
                    <Text style={styles.apiPromptButtonText}>Add API Key</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.apiPromptDismiss}
                    onPress={dismissAPIKeyPrompt}
                  >
                    <Text style={styles.apiPromptDismissText}>Continue with Demo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.languageSelectors}>
            <View style={styles.languageSelector}>
              <LanguageSelector
                selectedLanguage={sourceLanguage}
                onLanguageSelect={setSourceLanguage}
                label="From"
              />
            </View>

            <TouchableOpacity
              style={styles.swapButton}
              onPress={handleSwapLanguages}
            >
              <RotateCcw size={20} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.languageSelector}>
              <LanguageSelector
                selectedLanguage={targetLanguage}
                onLanguageSelect={setTargetLanguage}
                label="To"
              />
            </View>
          </View>

          <View style={styles.translationArea}>
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Enter text</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Type something to translate..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.inputActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearAll}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.translateButton, isTranslating && styles.translatingButton]}
                  onPress={handleTranslate}
                  disabled={isTranslating}
                >
                  <Send size={18} color="#ffffff" />
                  <Text style={styles.translateButtonText}>
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {translatedText ? (
              <View style={styles.outputSection}>
                <View style={styles.outputHeader}>
                  <Text style={styles.sectionLabel}>Translation</Text>
                  <View style={styles.audioControls}>
                    {elevenLabsService.isConfigured() ? (
                      <View style={styles.aiVoiceContainer}>
                        <Sparkles size={14} color="#8b5cf6" />
                        <Text style={styles.aiVoiceLabel}>AI Voice</Text>
                        <AudioPlayer
                          text={translatedText}
                          language={targetLanguage}
                          size="medium"
                          variant="primary"
                        />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.speakButton}
                        onPress={handleFallbackSpeak}
                      >
                        <Volume2 size={18} color="#2563eb" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={styles.translatedTextContainer}>
                  <Text style={styles.translatedText}>{translatedText}</Text>
                </View>
                
                {elevenLabsService.isConfigured() && (
                  <View style={styles.enhancementBadge}>
                    <Sparkles size={12} color="#8b5cf6" />
                    <Text style={styles.enhancementText}>
                      Enhanced with ElevenLabs AI voices
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          <View style={styles.voiceSection}>
            <Text style={styles.voiceSectionTitle}>Voice Translation</Text>
            <Text style={styles.voiceSectionSubtitle}>
              Hold the button and speak in {sourceLanguage === 'en' ? 'English' : sourceLanguage}
            </Text>
            <View style={styles.recordingContainer}>
              <RecordingButton
                isRecording={isRecording}
                onPress={handleRecord}
              />
            </View>
          </View>

          {!elevenLabsService.isConfigured() && (
            <View style={styles.upgradeSection}>
              <View style={styles.upgradeCard}>
                <Sparkles size={24} color="#8b5cf6" />
                <Text style={styles.upgradeTitle}>Upgrade to AI Voices</Text>
                <Text style={styles.upgradeDescription}>
                  Get natural, human-like voices in 29+ languages with ElevenLabs integration
                </Text>
                <View style={styles.upgradeFeatures}>
                  <Text style={styles.upgradeFeature}>• Premium voice quality</Text>
                  <Text style={styles.upgradeFeature}>• Natural pronunciation</Text>
                  <Text style={styles.upgradeFeature}>• Multiple voice options</Text>
                </View>
                <Text style={styles.upgradeInstructions}>
                  Add your ElevenLabs API key in settings to enable
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  boltBadge: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  boltContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boltIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltEmoji: {
    fontSize: 12,
    color: '#ffffff',
  },
  boltText: {
    alignItems: 'flex-start',
  },
  boltLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    lineHeight: 12,
  },
  boltName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    lineHeight: 14,
  },
  apiPrompt: {
    margin: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  apiPromptContent: {
    padding: 20,
  },
  apiPromptTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  apiPromptDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    lineHeight: 20,
    marginBottom: 16,
  },
  apiPromptActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  apiPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  apiPromptButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  apiPromptDismiss: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  apiPromptDismissText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  languageSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#ffffff',
    marginTop: 8,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  languageSelector: {
    flex: 1,
  },
  swapButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  translationArea: {
    margin: 16,
    gap: 16,
  },
  inputSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    minHeight: 100,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    textAlignVertical: 'top',
    lineHeight: 24,
    marginBottom: 16,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  translatingButton: {
    backgroundColor: '#9ca3af',
  },
  translateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  outputSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiVoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiVoiceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8b5cf6',
  },
  speakButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
  },
  translatedTextContainer: {
    minHeight: 80,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  translatedText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
    lineHeight: 24,
  },
  enhancementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#faf5ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    gap: 4,
  },
  enhancementText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#8b5cf6',
  },
  voiceSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  voiceSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  voiceSectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  recordingContainer: {
    alignItems: 'center',
  },
  upgradeSection: {
    margin: 16,
    marginTop: 0,
  },
  upgradeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  upgradeTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeFeatures: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  upgradeFeature: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  upgradeInstructions: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8b5cf6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});