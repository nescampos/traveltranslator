import { Platform } from 'react-native';
import { Audio } from 'expo-av';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for different languages (ElevenLabs multilingual voices)
const VOICE_MAP: Record<string, string> = {
  'en': 'pNInz6obpgDQGcFmaJgB', // Adam (English)
  'es': 'VR6AewLTigWG4xSOukaG', // Antoni (Spanish)
  'fr': 'TxGEqnHWrfWFTfGW9XjX', // Josh (French)
  'de': 'pqHfZKP75CvOlQylNhV4', // Bill (German)
  'it': 'XB0fDUnXU5powFXDhCwa', // Charlotte (Italian)
  'pt': 'IKne3meq5aSn9XLyUdCD', // Charlie (Portuguese)
  'ru': 'onwK4e9ZLuTAKqWW03F9', // Daniel (Russian)
  'ja': 'bVMeCyTHy58xNoL34h3p', // Eric (Japanese)
  'ko': 'AZnzlk1XvdvUeBnXmlld', // Gigi (Korean)
  'zh': 'pFZP5JQG7iQjIQuC4Bku', // Freya (Chinese)
  'ar': 'N2lVS1w4EtoT3dr4eOWO', // Callum (Arabic)
  'hi': 'TX3LPaxmHKxFdv7VOQHJ', // Liam (Hindi)
  'th': 'pNInz6obpgDQGcFmaJgB', // Fallback to Adam
  'vi': 'pNInz6obpgDQGcFmaJgB', // Fallback to Adam
  'tr': 'pNInz6obpgDQGcFmaJgB', // Fallback to Adam
  'pl': 'pNInz6obpgDQGcFmaJgB', // Fallback to Adam
  'nl': 'pNInz6obpgDQGcFmaJgB', // Fallback to Adam
  'sv': 'pNInz6obpgDQGcFmaJgB', // Fallback to Adam
  'da': 'pNInz6obpgDQGcFmaJgB', // Fallback to Adam
  'no': 'pNInz6obpgDQGcFmaJgB', // Fallback to Adam
};

export interface TTSRequest {
  text: string;
  language: string;
  voiceId?: string;
}

export interface TTSResponse {
  audioUri: string;
  success: boolean;
  error?: string;
}

export class ElevenLabsService {
  private static instance: ElevenLabsService;
  private audioCache = new Map<string, string>();

  private constructor() {}

  public static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      if (!ELEVENLABS_API_KEY) {
        return {
          audioUri: '',
          success: false,
          error: 'ElevenLabs API key not configured'
        };
      }

      // Check cache first
      const cacheKey = `${request.text}_${request.language}`;
      if (this.audioCache.has(cacheKey)) {
        return {
          audioUri: this.audioCache.get(cacheKey)!,
          success: true
        };
      }

      const voiceId = request.voiceId || VOICE_MAP[request.language] || VOICE_MAP['en'];
      
      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: request.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      // Convert blob to base64 for React Native
      const reader = new FileReader();
      const audioUri = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Cache the result
      this.audioCache.set(cacheKey, audioUri);

      return {
        audioUri,
        success: true
      };

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      return {
        audioUri: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async playAudio(audioUri: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web implementation
        const audio = new window.Audio(audioUri);
        await audio.play();
      } else {
        // Mobile implementation
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        
        // Cleanup after playing
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.audioCache.clear();
  }

  isConfigured(): boolean {
    return !!ELEVENLABS_API_KEY;
  }
}