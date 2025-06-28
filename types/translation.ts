export interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  targetLanguage: string;
  timestamp: number;
  isAudio: boolean;
  audioUri?: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  originalText: string;
  fromLanguage: string;
  toLanguage: string;
}