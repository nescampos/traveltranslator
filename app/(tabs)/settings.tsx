import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { ChevronRight, Globe, Volume2, Moon, Info, Sparkles, Key, Eye, EyeOff, Brain } from 'lucide-react-native';
import { LanguageSelector } from '@/components/LanguageSelector';
import { StorageService, AppSettings } from '@/services/storageService';
import { ElevenLabsService } from '@/services/elevenLabsService';
import { TranslationService } from '@/services/translationService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    defaultSourceLanguage: 'en',
    defaultTargetLanguage: 'es',
    darkMode: false,
    autoSpeak: true,
  });
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [isElevenLabsConfigured, setIsElevenLabsConfigured] = useState(false);
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState(false);
  const [hasEnvOpenAI, setHasEnvOpenAI] = useState(false);

  const storageService = StorageService.getInstance();
  const elevenLabsService = ElevenLabsService.getInstance();
  const translationService = TranslationService.getInstance();

  useEffect(() => {
    loadSettings();
    checkAPIConfigurations();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await storageService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkAPIConfigurations = async () => {
    // Check ElevenLabs
    setIsElevenLabsConfigured(elevenLabsService.isConfigured());
    
    // Check OpenAI - both environment and user-provided
    const envConfigured = translationService.isEnvironmentConfigured();
    const userConfigured = await translationService.isUserConfigured();
    
    setHasEnvOpenAI(envConfigured);
    setIsOpenAIConfigured(envConfigured || userConfigured);
    
    if (userConfigured && !envConfigured) {
      const userKey = await storageService.getOpenAIKey();
      setOpenAIKey(userKey || '');
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await storageService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleSourceLanguageChange = (language: string) => {
    saveSettings({ ...settings, defaultSourceLanguage: language });
  };

  const handleTargetLanguageChange = (language: string) => {
    saveSettings({ ...settings, defaultTargetLanguage: language });
  };

  const handleAutoSpeakToggle = (value: boolean) => {
    saveSettings({ ...settings, autoSpeak: value });
  };

  const handleDarkModeToggle = (value: boolean) => {
    saveSettings({ ...settings, darkMode: value });
  };

  const handleSaveOpenAIKey = async () => {
    if (!openAIKey.trim()) {
      Alert.alert('Error', 'Please enter a valid OpenAI API key');
      return;
    }

    try {
      await storageService.saveOpenAIKey(openAIKey.trim());
      setIsOpenAIConfigured(true);
      Alert.alert('Success', 'OpenAI API key saved successfully');
    } catch (error) {
      console.error('Error saving OpenAI key:', error);
      Alert.alert('Error', 'Failed to save OpenAI API key');
    }
  };

  const handleRemoveOpenAIKey = () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your OpenAI API key? You will need to re-enter it to use real translations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.removeOpenAIKey();
              setOpenAIKey('');
              setIsOpenAIConfigured(hasEnvOpenAI);
              Alert.alert('Success', 'OpenAI API key removed');
            } catch (error) {
              console.error('Error removing OpenAI key:', error);
              Alert.alert('Error', 'Failed to remove OpenAI API key');
            }
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About Travel Translator',
      'Version 1.0.0\n\nA powerful translation app for travelers, powered by OpenAI and ElevenLabs technology.\n\nPerfect for communicating with locals anywhere in the world with natural AI voices.',
      [{ text: 'OK' }]
    );
  };

  const showElevenLabsInfo = () => {
    Alert.alert(
      'ElevenLabs AI Voices',
      'ElevenLabs provides premium AI voices that sound natural and human-like.\n\n• 29+ languages supported\n• Multiple voice options\n• High-quality audio\n• Fast generation\n\nSign up at elevenlabs.io to get your API key.',
      [
        { text: 'Cancel' },
        { text: 'Visit ElevenLabs', onPress: () => {
          // In a real app, you would open the browser
          console.log('Opening ElevenLabs website');
        }}
      ]
    );
  };

  const showOpenAIInfo = () => {
    Alert.alert(
      'OpenAI Translation',
      'OpenAI provides advanced AI translation capabilities using GPT models.\n\n• Accurate context-aware translations\n• 50+ languages supported\n• Natural language understanding\n• Cultural context preservation\n\nSign up at platform.openai.com to get your API key.',
      [
        { text: 'Cancel' },
        { text: 'Visit OpenAI', onPress: () => {
          console.log('Opening OpenAI website');
        }}
      ]
    );
  };

  const clearElevenLabsCache = () => {
    elevenLabsService.clearCache();
    Alert.alert('Success', 'Audio cache cleared');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your translation experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Languages</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <Globe size={20} color="#2563eb" />
              <Text style={styles.settingTitle}>Source Language</Text>
            </View>
            <LanguageSelector
              selectedLanguage={settings.defaultSourceLanguage}
              onLanguageSelect={handleSourceLanguageChange}
              label="Default source language"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <Globe size={20} color="#2563eb" />
              <Text style={styles.settingTitle}>Target Language</Text>
            </View>
            <LanguageSelector
              selectedLanguage={settings.defaultTargetLanguage}
              onLanguageSelect={handleTargetLanguageChange}
              label="Default target language"
            />
          </View>
        </View>

        {!hasEnvOpenAI && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>OpenAI Translation</Text>
              <TouchableOpacity onPress={showOpenAIInfo}>
                <Info size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
            
            {isOpenAIConfigured ? (
              <View style={styles.configuredContainer}>
                <View style={styles.configuredHeader}>
                  <Brain size={20} color="#10b981" />
                  <Text style={styles.configuredTitle}>OpenAI Connected</Text>
                </View>
                <Text style={styles.configuredDescription}>
                  Advanced AI translations are enabled with your API key
                </Text>
                <TouchableOpacity style={styles.removeButton} onPress={handleRemoveOpenAIKey}>
                  <Text style={styles.removeButtonText}>Remove API Key</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.apiKeyContainer}>
                <View style={styles.apiKeyHeader}>
                  <Key size={20} color="#2563eb" />
                  <Text style={styles.apiKeyTitle}>OpenAI API Key</Text>
                </View>
                <Text style={styles.apiKeyDescription}>
                  Add your OpenAI API key to enable advanced AI translations
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.apiKeyInput}
                    placeholder="Enter your OpenAI API key (sk-...)"
                    value={openAIKey}
                    onChangeText={setOpenAIKey}
                    secureTextEntry={!showOpenAIKey}
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowOpenAIKey(!showOpenAIKey)}
                  >
                    {showOpenAIKey ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={[styles.saveButton, !openAIKey.trim() && styles.saveButtonDisabled]} 
                  onPress={handleSaveOpenAIKey}
                  disabled={!openAIKey.trim()}
                >
                  <Text style={[styles.saveButtonText, !openAIKey.trim() && styles.saveButtonTextDisabled]}>
                    Save API Key
                  </Text>
                </TouchableOpacity>
                <Text style={styles.apiKeyNote}>
                  Note: API keys are stored locally and only used for OpenAI requests
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Voice Settings</Text>
            <TouchableOpacity onPress={showElevenLabsInfo}>
              <Info size={16} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
          
          {isElevenLabsConfigured ? (
            <View style={styles.configuredContainer}>
              <View style={styles.configuredHeader}>
                <Sparkles size={20} color="#10b981" />
                <Text style={styles.configuredTitle}>ElevenLabs Connected</Text>
              </View>
              <Text style={styles.configuredDescription}>
                Premium AI voices are enabled for natural-sounding translations
              </Text>
              <TouchableOpacity style={styles.cacheButton} onPress={clearElevenLabsCache}>
                <Text style={styles.cacheButtonText}>Clear Audio Cache</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.apiKeyContainer}>
              <View style={styles.apiKeyHeader}>
                <Key size={20} color="#8b5cf6" />
                <Text style={styles.apiKeyTitle}>ElevenLabs API Key</Text>
              </View>
              <Text style={styles.apiKeyDescription}>
                Add your ElevenLabs API key to enable premium AI voices
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.apiKeyInput}
                  placeholder="Enter your ElevenLabs API key"
                  value={elevenLabsKey}
                  onChangeText={setElevenLabsKey}
                  secureTextEntry={!showElevenLabsKey}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowElevenLabsKey(!showElevenLabsKey)}
                >
                  {showElevenLabsKey ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.apiKeyNote}>
                Note: API keys are stored locally and only used for ElevenLabs requests
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio & Speech</Text>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Volume2 size={20} color="#2563eb" />
              <View style={styles.toggleTexts}>
                <Text style={styles.toggleTitle}>Auto-speak translations</Text>
                <Text style={styles.toggleSubtitle}>
                  {isElevenLabsConfigured 
                    ? 'Automatically play AI voice for translations'
                    : 'Automatically speak translated text (system voice)'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoSpeak}
              onValueChange={handleAutoSpeakToggle}
              trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
              thumbColor={settings.autoSpeak ? '#2563eb' : '#9ca3af'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Moon size={20} color="#2563eb" />
              <View style={styles.toggleTexts}>
                <Text style={styles.toggleTitle}>Dark mode</Text>
                <Text style={styles.toggleSubtitle}>
                  Use dark theme (coming soon)
                </Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
              thumbColor={settings.darkMode ? '#2563eb' : '#9ca3af'}
              disabled={true}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={showAbout}>
            <View style={styles.menuItemLeft}>
              <Info size={20} color="#2563eb" />
              <View style={styles.menuItemTexts}>
                <Text style={styles.menuItemTitle}>About Travel Translator</Text>
                <Text style={styles.menuItemSubtitle}>
                  Version 1.0.0
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for travelers worldwide
          </Text>
          {(isElevenLabsConfigured || isOpenAIConfigured) && (
            <View style={styles.poweredBy}>
              {isOpenAIConfigured && (
                <View style={styles.poweredByItem}>
                  <Brain size={12} color="#2563eb" />
                  <Text style={styles.poweredByText}>Powered by OpenAI</Text>
                </View>
              )}
              {isElevenLabsConfigured && (
                <View style={styles.poweredByItem}>
                  <Sparkles size={12} color="#8b5cf6" />
                  <Text style={styles.poweredByText}>Powered by ElevenLabs AI</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    marginHorizontal: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  configuredContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  configuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  configuredTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  configuredDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#065f46',
    marginBottom: 12,
  },
  cacheButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cacheButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  removeButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#dc2626',
  },
  apiKeyContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  apiKeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  apiKeyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  apiKeyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 12,
  },
  apiKeyInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  eyeButton: {
    padding: 12,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  saveButtonTextDisabled: {
    color: '#9ca3af',
  },
  apiKeyNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    fontStyle: 'italic',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleTexts: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuItemTexts: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  poweredBy: {
    alignItems: 'center',
    gap: 8,
  },
  poweredByItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  poweredByText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
});