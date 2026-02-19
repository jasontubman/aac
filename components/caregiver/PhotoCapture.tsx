import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { createMediaAsset, createButton, getButtonsByBoard } from '../../database/queries';
import { generateId } from '../../utils/id';
import {
  cropToSquare,
  simplifyBackground,
  saveImageToAppDirectory,
} from '../../utils/imageProcessing';
import { useAACStore } from '../../store/aacStore';
import { isValidImageUri } from '../../utils/performance';

interface PhotoCaptureProps {
  boardId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  boardId,
  onComplete,
  onCancel,
}) => {
  const { activeProfile } = useProfileStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const { currentBoard } = useAACStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [label, setLabel] = useState('');
  const [speechText, setSpeechText] = useState('');
  const [useCamera, setUseCamera] = useState(true);

  if (!isFeatureAvailable('photo_additions')) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Photo personalization requires an active subscription.
        </Text>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission needed', 'Camera permission is required');
        return;
      }
    }

    // Camera capture would go here
    // For now, use image picker as fallback
    handlePickImage();
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setLabel('');
        setSpeechText('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Error picking image:', error);
    }
  };

  const handleProcessAndSave = async () => {
    if (!capturedImage || !label.trim() || !speechText.trim() || !activeProfile || !currentBoard) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setProcessing(true);
    try {
      // Process image: crop to square and simplify background
      const croppedUri = await cropToSquare(capturedImage);
      const processedUri = await simplifyBackground(croppedUri);

      // Save to app directory
      const filename = `photo_${generateId()}.jpg`;
      const savedPath = await saveImageToAppDirectory(processedUri, filename);

      // Create media asset record
      const assetId = generateId();
      await createMediaAsset(assetId, activeProfile.id, savedPath, 'photo');

      // Create button with photo
      const buttonId = generateId();
      const buttons = await getButtonsByBoard(currentBoard.id);
      const position = buttons.length;

      await createButton(
        buttonId,
        currentBoard.id,
        label,
        speechText,
        savedPath,
        position
      );

      Alert.alert('Success', 'Photo added to board!', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to process and save photo');
      console.error('Error processing photo:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (capturedImage && isValidImageUri(capturedImage)) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />
        
        <View style={styles.form}>
          <Text style={styles.label}>Button Label</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g., 'Mom'"
          />

          <Text style={styles.label}>Speech Text</Text>
          <TextInput
            style={styles.input}
            value={speechText}
            onChangeText={setSpeechText}
            placeholder="e.g., 'I want to see mom'"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCapturedImage(null)}
              disabled={processing}
            >
              <Text style={styles.cancelButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleProcessAndSave}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={colors.text.light} />
              ) : (
                <Text style={styles.saveButtonText}>Save to Board</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Photo to Board</Text>
      
      <View style={styles.options}>
        <TouchableOpacity style={styles.optionButton} onPress={handleTakePhoto}>
          <Text style={styles.optionButtonText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton} onPress={handlePickImage}>
          <Text style={styles.optionButtonText}>Choose from Library</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    padding: spacing.md,
  },
  title: {
    ...typography.heading.h1,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  options: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  optionButtonText: {
    ...typography.button.large,
    color: colors.text.light,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  form: {
    flex: 1,
  },
  label: {
    ...typography.label.medium,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body.medium,
    backgroundColor: colors.background.light,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.button.medium,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  errorText: {
    ...typography.body.medium,
    color: colors.error,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
