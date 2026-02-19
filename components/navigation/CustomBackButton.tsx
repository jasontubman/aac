import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../theme';

interface CustomBackButtonProps {
  onPress?: () => void;
}

export const CustomBackButton: React.FC<CustomBackButtonProps> = ({ onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
      accessibilityLabel="Back"
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <Text style={styles.backIcon}>
          {Platform.OS === 'ios' ? '‹' : '←'}
        </Text>
        <Text style={styles.backText}>Back</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: Platform.OS === 'ios' ? 8 : 16,
    paddingRight: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
    height: '100%',
  },
  backIcon: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  backText: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
