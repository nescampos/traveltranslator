import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Volume2, VolumeX, Loader as Loader2 } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { ElevenLabsService } from '@/services/elevenLabsService';

interface AudioPlayerProps {
  text: string;
  language: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
}

export function AudioPlayer({ 
  text, 
  language, 
  disabled = false, 
  size = 'medium',
  variant = 'primary'
}: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const elevenLabsService = ElevenLabsService.getInstance();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePlay = async () => {
    if (disabled || isLoading || !text.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setIsPlaying(true);

      // Start loading animation
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );

      const response = await elevenLabsService.generateSpeech({
        text: text.trim(),
        language
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate speech');
      }

      // Stop loading animation
      rotation.value = withTiming(0);
      
      // Play success animation
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );

      await elevenLabsService.playAudio(response.audioUri);

    } catch (err) {
      console.error('Audio playback error:', err);
      setError(err instanceof Error ? err.message : 'Playback failed');
      
      // Stop animations
      rotation.value = withTiming(0);
      scale.value = withTiming(1);
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButton);
    } else {
      baseStyle.push(styles.primaryButton);
    }
    
    if (size === 'small') {
      baseStyle.push(styles.smallButton);
    } else if (size === 'large') {
      baseStyle.push(styles.largeButton);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    return baseStyle;
  };

  const getIconColor = () => {
    if (disabled) return '#9ca3af';
    if (variant === 'secondary') return '#6b7280';
    return '#ffffff';
  };

  const renderIcon = () => {
    if (isLoading) {
      return <Loader2 size={getIconSize()} color={getIconColor()} />;
    }
    
    if (error) {
      return <VolumeX size={getIconSize()} color="#dc2626" />;
    }
    
    return <Volume2 size={getIconSize()} color={getIconColor()} />;
  };

  const isElevenLabsConfigured = elevenLabsService.isConfigured();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePlay}
        disabled={disabled || isLoading || !isElevenLabsConfigured}
        activeOpacity={0.7}
      >
        <Animated.View style={animatedStyle}>
          {renderIcon()}
        </Animated.View>
      </TouchableOpacity>
      
      {error && size !== 'small' && (
        <Text style={styles.errorText}>Audio unavailable</Text>
      )}
      
      {!isElevenLabsConfigured && size !== 'small' && (
        <Text style={styles.configText}>Configure ElevenLabs for AI voices</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 10,
  },
  secondaryButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
  },
  smallButton: {
    padding: 6,
  },
  largeButton: {
    padding: 14,
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
    shadowOpacity: 0,
    elevation: 0,
  },
  errorText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#dc2626',
    marginTop: 4,
    textAlign: 'center',
  },
  configText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 80,
  },
});