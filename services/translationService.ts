import { TranslationRequest, TranslationResponse } from '@/types/translation';
import { StorageService } from '@/services/storageService';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export class TranslationService {
  private static instance: TranslationService;
  private storageService: StorageService;

  private constructor() {
    this.storageService = StorageService.getInstance();
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      // Try to get API key from environment first, then from user storage
      let apiKey = OPENAI_API_KEY;
      if (!apiKey) {
        apiKey = await this.storageService.getOpenAIKey();
      }

      if (!apiKey) {
        console.warn('OpenAI API key not configured, using simulation');
        return this.simulateTranslation(request);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text from ${this.getLanguageName(request.fromLanguage)} to ${this.getLanguageName(request.toLanguage)}. 

Rules:
- Only return the translated text, nothing else
- Maintain the original tone and style
- If the text is already in the target language, return it as-is
- For proper nouns, keep them in their original form unless they have established translations
- Preserve formatting and punctuation`
            },
            {
              role: 'user',
              content: request.text
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
      }

      const translatedText = data.choices[0].message.content.trim();

      return {
        translatedText,
        originalText: request.text,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
      };
    } catch (error) {
      console.error('Translation error:', error);
      
      // If OpenAI fails, fall back to simulation with a note
      const simulatedResult = this.simulateTranslation(request);
      
      // Add a note that this is a fallback
      return {
        ...simulatedResult,
        translatedText: `[Demo] ${simulatedResult.translatedText}`,
      };
    }
  }

  private getLanguageName(code: string): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'tr': 'Turkish',
      'pl': 'Polish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
    };
    
    return languageNames[code] || code;
  }

  private simulateTranslation(request: TranslationRequest): TranslationResponse {
    // Enhanced simulation with more realistic translations
    const translations: Record<string, Record<string, string>> = {
      'Hello': {
        'es': 'Hola',
        'fr': 'Bonjour',
        'de': 'Hallo',
        'it': 'Ciao',
        'pt': 'Olá',
        'ru': 'Привет',
        'ja': 'こんにちは',
        'ko': '안녕하세요',
        'zh': '你好',
        'ar': 'مرحبا',
        'hi': 'नमस्ते',
      },
      'Thank you': {
        'es': 'Gracias',
        'fr': 'Merci',
        'de': 'Danke',
        'it': 'Grazie',
        'pt': 'Obrigado',
        'ru': 'Спасибо',
        'ja': 'ありがとう',
        'ko': '감사합니다',
        'zh': '谢谢',
        'ar': 'شكرا',
        'hi': 'धन्यवाद',
      },
      'Excuse me': {
        'es': 'Disculpe',
        'fr': 'Excusez-moi',
        'de': 'Entschuldigung',
        'it': 'Mi scusi',
        'pt': 'Desculpe',
        'ru': 'Извините',
        'ja': 'すみません',
        'ko': '실례합니다',
        'zh': '对不起',
        'ar': 'عذرا',
        'hi': 'माफ करें',
      },
      'Where is the bathroom?': {
        'es': '¿Dónde está el baño?',
        'fr': 'Où sont les toilettes?',
        'de': 'Wo ist die Toilette?',
        'it': 'Dove è il bagno?',
        'pt': 'Onde fica o banheiro?',
        'ru': 'Где туалет?',
        'ja': 'トイレはどこですか？',
        'ko': '화장실이 어디에 있나요?',
        'zh': '洗手间在哪里？',
        'ar': 'أين الحمام؟',
        'hi': 'बाथरूम कहाँ है?',
      },
      'How much does this cost?': {
        'es': '¿Cuánto cuesta esto?',
        'fr': 'Combien ça coûte?',
        'de': 'Wie viel kostet das?',
        'it': 'Quanto costa questo?',
        'pt': 'Quanto custa isso?',
        'ru': 'Сколько это стоит?',
        'ja': 'これはいくらですか？',
        'ko': '이것은 얼마입니까?',
        'zh': '这个多少钱？',
        'ar': 'كم يكلف هذا؟',
        'hi': 'इसकी कीमत कितनी है?',
      },
      'I need help': {
        'es': 'Necesito ayuda',
        'fr': "J'ai besoin d'aide",
        'de': 'Ich brauche Hilfe',
        'it': 'Ho bisogno di aiuto',
        'pt': 'Preciso de ajuda',
        'ru': 'Мне нужна помощь',
        'ja': '助けが必要です',
        'ko': '도움이 필요합니다',
        'zh': '我需要帮助',
        'ar': 'أحتاج مساعدة',
        'hi': 'मुझे मदद चाहिए',
      },
    };

    // Check for exact matches first
    const exactTranslation = translations[request.text]?.[request.toLanguage];
    if (exactTranslation) {
      return {
        translatedText: exactTranslation,
        originalText: request.text,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
      };
    }

    // Check for partial matches (case insensitive)
    const lowerText = request.text.toLowerCase();
    for (const [key, langMap] of Object.entries(translations)) {
      if (lowerText.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerText)) {
        const translation = langMap[request.toLanguage];
        if (translation) {
          return {
            translatedText: translation,
            originalText: request.text,
            fromLanguage: request.fromLanguage,
            toLanguage: request.toLanguage,
          };
        }
      }
    }

    // Fallback: create a simulated translation
    const translatedText = `[${request.toLanguage.toUpperCase()}] ${request.text}`;

    return {
      translatedText,
      originalText: request.text,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
    };
  }

  isEnvironmentConfigured(): boolean {
    return !!OPENAI_API_KEY;
  }

  async isUserConfigured(): Promise<boolean> {
    const userKey = await this.storageService.getOpenAIKey();
    return !!userKey;
  }

  isConfigured(): boolean {
    return this.isEnvironmentConfigured();
  }
}