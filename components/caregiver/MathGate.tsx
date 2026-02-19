import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useUIStore } from '../../store/uiStore';
import { CAREGIVER_GATE } from '../../utils/constants';

export const MathGate: React.FC = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(CAREGIVER_GATE.TIMEOUT_SECONDS);
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

  const handleSubmit = () => {
    const correctAnswer = num1 + num2;
    const userAnswer = parseInt(answer, 10);

    if (userAnswer === correctAnswer) {
      unlockCaregiverMode();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
    <View style={styles.container}>
      <Text style={styles.title}>Caregiver Access</Text>
      <Text style={styles.instruction}>Solve this math problem to continue:</Text>
      
      <View style={styles.problemContainer}>
        <Text style={styles.problem}>
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
      />

      <Text style={styles.timer}>Time left: {timeLeft}s</Text>
      <Text style={styles.attempts}>
        Attempts: {attempts}/{CAREGIVER_GATE.MAX_ATTEMPTS}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.light,
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
  },
  problem: {
    ...typography.display.large,
    fontSize: 48,
    color: colors.primary[600],
    textAlign: 'center',
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
