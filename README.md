# Travel Translator

A powerful, AI-enhanced translation app built with React Native and Expo, designed specifically for travelers who need reliable communication tools anywhere in the world.

## 🌟 Features

### Core Translation
- **Real-time Text Translation**: Powered by OpenAI's GPT-4 for accurate, context-aware translations
- **29+ Languages Supported**: Comprehensive language coverage for global travel
- **Smart Language Detection**: Automatic detection of source language
- **Bidirectional Translation**: Easy language swapping with one tap

### AI Voice Technology
- **Premium AI Voices**: Integration with ElevenLabs for natural, human-like speech
- **Multiple Voice Options**: Different voice personalities for each language
- **High-Quality Audio**: Crystal-clear pronunciation and natural intonation
- **Offline Fallback**: System text-to-speech when AI voices aren't available

### User Experience
- **Translation History**: Automatic saving of all translations for easy reference
- **Offline Mode**: Core functionality works without internet connection
- **Beautiful UI**: Apple-level design aesthetics with smooth animations
- **Voice Recording**: Speak naturally and get instant translations (coming soon)

### Customization
- **Default Languages**: Set your preferred source and target languages
- **Auto-Speak**: Automatic pronunciation of translations
- **Dark Mode**: Eye-friendly interface (coming soon)
- **Audio Cache**: Smart caching for faster voice playback

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-translator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Add your API keys to `.env`**
   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### OpenAI Setup (Required for Real Translations)

1. **Get an OpenAI API Key**
   - Visit [OpenAI API](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key
   - Add billing information (pay-per-use pricing)

2. **Add to Environment**
   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
   ```

### ElevenLabs Setup (Optional - For Premium AI Voices)

1. **Get an ElevenLabs API Key**
   - Visit [ElevenLabs](https://elevenlabs.io)
   - Create an account
   - Go to Profile Settings → API Keys
   - Generate a new API key

2. **Add to Environment**
   ```env
   EXPO_PUBLIC_ELEVENLABS_API_KEY=your-elevenlabs-key-here
   ```

## 📱 Usage Guide

### Basic Translation

1. **Select Languages**
   - Tap the "From" dropdown to select source language
   - Tap the "To" dropdown to select target language
   - Use the swap button (🔄) to quickly reverse languages

2. **Enter Text**
   - Type or paste text in the input field
   - Tap "Translate" to get instant translation
   - Translation appears in the blue highlighted area

3. **Listen to Translation**
   - With ElevenLabs: Tap the AI voice button for premium audio
   - Without ElevenLabs: Tap the speaker icon for system voice

### Voice Translation (Coming Soon)

1. **Prepare for Recording**
   - Ensure microphone permissions are granted
   - Select your source language

2. **Record Speech**
   - Hold the microphone button
   - Speak clearly in your selected language
   - Release when finished

3. **Get Results**
   - Speech is automatically transcribed
   - Translation appears instantly
   - Audio playback available immediately

### Managing History

1. **View Past Translations**
   - Navigate to the "History" tab
   - Scroll through chronological list
   - Tap any translation to hear it again

2. **Clear History**
   - Tap "Clear All" in the history tab
   - Confirm deletion in the popup
   - All translations are permanently removed

### Settings & Customization

1. **Default Languages**
   - Go to Settings tab
   - Set preferred source language
   - Set preferred target language
   - These become defaults for new sessions

2. **Audio Settings**
   - Toggle auto-speak on/off
   - Configure ElevenLabs integration
   - Clear audio cache if needed

3. **ElevenLabs Integration**
   - Add API key in settings
   - Enjoy premium AI voices
   - Multiple voice options per language

## 🌍 Supported Languages

The app supports 20+ languages including:

- **European**: English, Spanish, French, German, Italian, Portuguese, Russian, Polish, Dutch, Swedish, Danish, Norwegian
- **Asian**: Japanese, Korean, Chinese (Mandarin), Hindi, Thai, Vietnamese, Turkish
- **Middle Eastern**: Arabic

Each language includes:
- Text translation capabilities
- Text-to-speech support
- ElevenLabs AI voice integration (where available)

## 🏗️ Technical Architecture

### Frontend Framework
- **React Native**: Cross-platform mobile development
- **Expo Router**: File-based navigation system
- **TypeScript**: Type-safe development
- **React Native Reanimated**: Smooth animations

### Backend Services
- **OpenAI GPT-4**: Advanced language translation
- **ElevenLabs**: Premium AI voice synthesis
- **AsyncStorage**: Local data persistence

### Key Components

```
app/
├── (tabs)/
│   ├── index.tsx          # Main translation interface
│   ├── history.tsx        # Translation history
│   └── settings.tsx       # App configuration
├── components/
│   ├── AudioPlayer.tsx    # AI voice playback
│   ├── LanguageSelector.tsx # Language picker
│   ├── RecordingButton.tsx # Voice input (future)
│   └── TranslationCard.tsx # History item display
└── services/
    ├── translationService.ts # OpenAI integration
    ├── elevenLabsService.ts  # Voice synthesis
    └── storageService.ts     # Local data management
```

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: All translations stored locally on device
- **No Cloud Sync**: Your data never leaves your device
- **API Security**: API keys stored securely in environment variables
- **Minimal Data**: Only text and timestamps stored

### API Usage
- **OpenAI**: Text sent for translation only, not stored by OpenAI
- **ElevenLabs**: Text sent for voice synthesis, not stored permanently
- **No Tracking**: No analytics or user behavior tracking

## 🚀 Deployment

### Development Build

```bash
# iOS
expo run:ios

# Android
expo run:android

# Web
expo start --web
```

### Production Build

```bash
# Build for app stores
expo build:ios
expo build:android

# Web deployment
expo export --platform web
```

### Environment Configuration

Create environment-specific files:
- `.env.development` - Development settings
- `.env.staging` - Staging environment
- `.env.production` - Production configuration

## 🛠️ Development

### Project Structure

```
travel-translator/
├── app/                   # Expo Router pages
├── components/           # Reusable UI components
├── services/            # Business logic & API calls
├── types/               # TypeScript definitions
├── constants/           # App constants & configuration
├── hooks/               # Custom React hooks
└── assets/              # Images, fonts, etc.
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Implement Changes**
   - Add components in `/components`
   - Add services in `/services`
   - Update types in `/types`

3. **Test Thoroughly**
   - Test on iOS and Android
   - Verify web compatibility
   - Check offline functionality

## 🐛 Troubleshooting

### Common Issues

**Translation Not Working**
- Verify OpenAI API key is correct
- Check internet connection
- Ensure API key has sufficient credits

**AI Voices Not Playing**
- Verify ElevenLabs API key
- Check device audio settings
- Clear audio cache in settings

**App Crashes on Startup**
- Clear app data and restart
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo CLI version: `expo --version`

### Debug Mode

Enable debug logging by adding to `.env`:
```env
EXPO_PUBLIC_DEBUG=true
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

## 🎯 Roadmap

### Upcoming Features
- **Voice Recording**: Real-time speech-to-text translation
- **Offline Translation**: Basic translation without internet
- **Photo Translation**: OCR and translate text from images
- **Conversation Mode**: Back-and-forth translation interface
- **Phrasebook**: Common travel phrases by category
- **Dark Mode**: Complete dark theme implementation

### Long-term Goals
- **Multiple Voice Options**: Choose from different AI voices
- **Regional Dialects**: Support for regional language variations
- **Cultural Context**: Cultural notes and etiquette tips
- **Travel Integration**: Integration with maps and travel apps

---

**Made with ❤️ for travelers worldwide**

*Powered by OpenAI GPT-4 and ElevenLabs AI voices*