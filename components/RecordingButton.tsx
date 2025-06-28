import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Mic, MicOff } from 'lucide-react-native';

interface RecordingButtonProps {
  isRecording: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function RecordingButton({ isRecording, onPress, disabled }: RecordingButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withSpring(1.1, { damping: 10 }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(0.7, { duration: 1000 }),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.button, isRecording && styles.recording, animatedStyle]}>
        {isRecording ? (
          <MicOff size={32} color="#ffffff" />
        ) : (
          <Mic size={32} color="#ffffff" />
        )}
      </Animated.View>
      <Text style={[styles.text, isRecording && styles.recordingText]}>
        {isRecording ? 'Tap to Stop' : 'Hold to Speak'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recording: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  recordingText: {
    color: '#dc2626',
    fontFamily: 'Inter-SemiBold',
  },
});