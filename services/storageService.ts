import AsyncStorage from '@react-native-async-storage/async-storage';
import { Translation } from '@/types/translation';

const TRANSLATIONS_KEY = 'translations_history';
const SETTINGS_KEY = 'app_settings';
const OPENAI_KEY = 'openai_api_key';

export interface AppSettings {
  defaultSourceLanguage: string;
  defaultTargetLanguage: string;
  darkMode: boolean;
  autoSpeak: boolean;
}

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async saveTranslation(translation: Translation): Promise<void> {
    try {
      const existing = await this.getTranslations();
      const updated = [translation, ...existing.slice(0, 99)]; // Keep last 100
      await AsyncStorage.setItem(TRANSLATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  }

  async getTranslations(): Promise<Translation[]> {
    try {
      const data = await AsyncStorage.getItem(TRANSLATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading translations:', error);
      return [];
    }
  }

  async clearTranslations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TRANSLATIONS_KEY);
    } catch (error) {
      console.error('Error clearing translations:', error);
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {
        defaultSourceLanguage: 'en',
        defaultTargetLanguage: 'es',
        darkMode: false,
        autoSpeak: true,
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        defaultSourceLanguage: 'en',
        defaultTargetLanguage: 'es',
        darkMode: false,
        autoSpeak: true,
      };
    }
  }

  async saveOpenAIKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(OPENAI_KEY, apiKey);
    } catch (error) {
      console.error('Error saving OpenAI API key:', error);
      throw error;
    }
  }

  async getOpenAIKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(OPENAI_KEY);
    } catch (error) {
      console.error('Error loading OpenAI API key:', error);
      return null;
    }
  }

  async removeOpenAIKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OPENAI_KEY);
    } catch (error) {
      console.error('Error removing OpenAI API key:', error);
      throw error;
    }
  }
}