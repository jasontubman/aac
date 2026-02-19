import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useUIStore } from '../../store/uiStore';
import { CAREGIVER_GATE } from '../../utils/constants';

export const MathGate: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(CAREGIVER_GATE.TIMEOUT_SECONDS);
  const { unlockCaregiverMode } = useUIStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate math problem
  const generateProblem = () => {
    const min = CAREGIVER_GATE.MIN_MATH_VALUE;
    const max = CAREGIVER_GATE.MAX_MATH_VALUE;
    const n1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const n2 = Math.floor(Math.random() * (max - min + 1)) + min;
    setNum1(n1);
    setNum2(n2);
    setAnswer('');
  };

  // Start timer
  useEffect(() => {
    generateProblem();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          Alert.alert('Time\'s up', 'Please try again.');
          generateProblem();
          setAttempts(0);
          return CAREGIVER_GATE.TIMEOUT_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    const correctAnswer = num1 + num2;
    const userAnswer = parseInt(answer, 10);

    if (userAnswer === correctAnswer) {
      // Clear timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Unlock caregiver mode
      await unlockCaregiverMode();
      
      // Show success and navigate
      Alert.alert(
        'Access Granted',
        'Caregiver mode unlocked!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to caregiver dashboard
              router.replace('/caregiver');
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= CAREGIVER_GATE.MAX_ATTEMPTS) {
        Alert.alert('Too many attempts', 'Please try again later.');
        generateProblem();
        setAttempts(0);
        setTimeLeft(CAREGIVER_GATE.TIMEOUT_SECONDS);
      } else {
        Alert.alert('Incorrect', `Try again. ${CAREGIVER_GATE.MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        setAnswer('');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Caregiver Access</Text>
          <Text style={styles.instruction}>Solve this math problem to continue:</Text>
          
          <View style={styles.problemContainer}>
            <Text style={styles.problem} numberOfLines={1} adjustsFontSizeToFit>
              {num1} + {num2} = ?
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={answer}
            onChangeText={setAnswer}
            keyboardType="numeric"
            placeholder="Enter answer"
            autoFocus
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />

          <Text style={styles.timer}>Time left: {timeLeft}s</Text>
          <Text style={styles.attempts}>
            Attempts: {attempts}/{CAREGIVER_GATE.MAX_ATTEMPTS}
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  topSpacer: {
    height: spacing.xxxl,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  title: {
    ...typography.heading.h1,
    marginBottom: spacing.lg,
    color: colors.text.primary,
  },
  instruction: {
    ...typography.body.medium,
    marginBottom: spacing.xl,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  problemContainer: {
    marginVertical: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  problem: {
    ...typography.display.large,
    fontSize: 48,
    lineHeight: 56,
    color: colors.primary[600],
    textAlign: 'center',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  input: {
    width: '100%',
    maxWidth: 200,
    height: 60,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    ...typography.heading.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  timer: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  attempts: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button.large,
    color: colors.text.light,
  },
});
