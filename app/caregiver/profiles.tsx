import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { createProfile, updateProfile, deleteProfile } from '../../database/queries';
import { generateId } from '../../utils/id';
import { initializeCoreBoard } from '../../utils/coreBoard';
import { usageAnalytics, logEvent } from '../../services/usageAnalytics';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import type { Profile } from '../../database/types';
import { useToast } from '../../hooks/useToast';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';

export default function ProfilesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profiles, activeProfile, loadProfiles, setActiveProfile } = useProfileStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const { success, error: showError, ToastContainer } = useToast();

  useEffect(() => {
    const load = async () => {
      setIsLoadingProfiles(true);
      await loadProfiles();
      setIsLoadingProfiles(false);
    };
    load();
  }, []);

  const handleCreateProfile = async () => {
    if (!profileName.trim()) {
      showError('Please enter a name for the profile.');
      return;
    }

    // Check subscription for multi-profile
    if (profiles.length > 0 && !isFeatureAvailable('multi_profile')) {
      showError('Creating multiple profiles requires an active subscription.');
      // Optionally navigate to subscription
      // router.push('/caregiver/subscription');
      return;
    }

    setIsLoading(true);
    try {
      const profileId = generateId();
      await createProfile(profileId, profileName.trim(), profileAvatar);
      
      // Create core board for new profile
      await initializeCoreBoard(profileId);
      
      await logEvent('profile_create', { profileId, profileName: profileName.trim() });
      
      await loadProfiles();
      setShowCreateModal(false);
      setProfileName('');
      setProfileAvatar(null);
      
      success('Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error);
      showError('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!editingProfile || !profileName.trim()) {
      showError('Please enter a name for the profile.');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(editingProfile.id, {
        name: profileName.trim(),
        avatar_path: profileAvatar,
      });
      
      await logEvent('profile_edit', { 
        profileId: editingProfile.id, 
        changes: { name: profileName.trim() } 
      });
      
      await loadProfiles();
      
      // Update active profile if it's the one being edited
      if (activeProfile?.id === editingProfile.id) {
        const updated = await import('../../database/queries').then(m => m.getProfile(editingProfile.id));
        if (updated) {
          await setActiveProfile(updated);
        }
      }
      
      setShowEditModal(false);
      setEditingProfile(null);
      setProfileName('');
      setProfileAvatar(null);
      
      success('Profile updated successfully!');
      } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async (profile: Profile) => {
    if (profiles.length === 1) {
      showError('You must have at least one profile.');
      return;
    }

    setProfileToDelete(profile);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteProfile = async () => {
    if (!profileToDelete) return;

    try {
      await deleteProfile(profileToDelete.id);
      
      // If deleting active profile, switch to first available
      if (activeProfile?.id === profileToDelete.id) {
        const remaining = profiles.filter(p => p.id !== profileToDelete.id);
        if (remaining.length > 0) {
          await setActiveProfile(remaining[0]);
        } else {
          await setActiveProfile(null);
        }
      }
      
      await logEvent('profile_delete', { profileId: profileToDelete.id });
      await loadProfiles();
      
      success('Profile deleted successfully.');
    } catch (error) {
      console.error('Error deleting profile:', error);
      showError('Failed to delete profile. Please try again.');
    } finally {
      setDeleteConfirmVisible(false);
      setProfileToDelete(null);
    }
  };

  const handleSwitchProfile = async (profile: Profile) => {
    if (profile.id === activeProfile?.id) {
      return; // Already active
    }

    try {
      await setActiveProfile(profile);
      await usageAnalytics.logProfileSwitch(profile.id, profile.name);
      success(`Switched to ${profile.name}`);
    } catch (error) {
      console.error('Error switching profile:', error);
      showError('Failed to switch profile.');
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError('Please grant camera roll access to select an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileAvatar(result.assets[0].uri);
    }
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setProfileName(profile.name);
    setProfileAvatar(profile.avatar_path);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingProfile(null);
    setProfileName('');
    setProfileAvatar(null);
  };

  if (isLoadingProfiles) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading profiles..." fullScreen />
        <ToastContainer />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ToastContainer />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create Profile</Text>
        </TouchableOpacity>
        {profiles.length > 1 && !isFeatureAvailable('multi_profile') && (
          <Text style={styles.subscriptionNote}>
            Multiple profiles require subscription
          </Text>
        )}
      </View>

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.profileItem}>
            <TouchableOpacity
              style={[
                styles.profileContent,
                activeProfile?.id === item.id && styles.profileContentActive,
              ]}
              onPress={() => handleSwitchProfile(item)}
              accessibilityLabel={`Profile: ${item.name}${activeProfile?.id === item.id ? ', currently active' : ''}`}
              accessibilityHint={activeProfile?.id === item.id ? 'This is the active profile' : 'Tap to switch to this profile'}
              accessibilityRole="button"
            >
              {item.avatar_path ? (
                <Image source={{ uri: item.avatar_path }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{item.name}</Text>
                {activeProfile?.id === item.id && (
                  <Text style={styles.activeBadge}>Active</Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.profileActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              {profiles.length > 1 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteProfile(item)}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No profiles yet"
            message="Create your first profile to get started"
            actionLabel="Create Profile"
            onAction={() => setShowCreateModal(true)}
            icon="👤"
          />
        }
      />

      {/* Create Profile Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Profile</Text>
            
            <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar}>
              {profileAvatar ? (
                <Image source={{ uri: profileAvatar }} style={styles.modalAvatar} />
              ) : (
                <View style={styles.modalAvatarPlaceholder}>
                  <Text style={styles.modalAvatarText}>+</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Profile name"
              value={profileName}
              onChangeText={setProfileName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModals}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateProfile}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar}>
              {profileAvatar ? (
                <Image source={{ uri: profileAvatar }} style={styles.modalAvatar} />
              ) : (
                <View style={styles.modalAvatarPlaceholder}>
                  <Text style={styles.modalAvatarText}>
                    {profileName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Profile name"
              value={profileName}
              onChangeText={setProfileName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModals}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditProfile}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationDialog
        visible={deleteConfirmVisible}
        title="Delete Profile"
        message={`Are you sure you want to delete "${profileToDelete?.name}"? This will delete all boards, buttons, and data associated with this profile. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteProfile}
        onCancel={() => {
          setDeleteConfirmVisible(false);
          setProfileToDelete(null);
        }}
        destructive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  createButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  createButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  subscriptionNote: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  list: {
    padding: spacing.md,
  },
  profileItem: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  profileContentActive: {
    backgroundColor: colors.primary[50],
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.heading.h3,
    color: colors.text.light,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activeBadge: {
    ...typography.body.small,
    color: colors.primary[600],
    fontWeight: '600',
  },
  profileActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.neutral[200],
  },
  deleteButton: {
    borderRightWidth: 0,
  },
  actionButtonText: {
    ...typography.button.small,
    color: colors.primary[600],
  },
  deleteButtonText: {
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  avatarButton: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  modalAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    ...typography.heading.h1,
    color: colors.text.light,
  },
  input: {
    ...typography.body.medium,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.light,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.neutral[200],
  },
  cancelButtonText: {
    ...typography.button.medium,
    color: colors.text.primary,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
  },
  saveButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
});
