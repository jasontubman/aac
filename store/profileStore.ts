import { create } from 'zustand';
import { appStorage } from '../services/storage';
import { getProfile, getAllProfiles } from '../database/queries';
import type { Profile, ProfileSettings } from '../database/types';

interface ProfileState {
  // Current active profile
  activeProfile: Profile | null;
  profiles: Profile[];
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  setActiveProfile: (profile: Profile | null) => void;
  loadProfiles: () => Promise<void>;
  loadActiveProfile: () => Promise<void>;
  updateProfileSettings: (profileId: string, settings: ProfileSettings) => Promise<void>;
  
  // Initialize
  initialize: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  activeProfile: null,
  profiles: [],
  isLoading: false,

  setActiveProfile: async (profile: Profile | null) => {
    set({ activeProfile: profile });
    if (profile) {
      await appStorage.setActiveProfileId(profile.id);
    } else {
      await appStorage.setActiveProfileId(null);
    }
  },

  loadProfiles: async () => {
    set({ isLoading: true });
    try {
      const profiles = await getAllProfiles();
      set({ profiles, isLoading: false });
    } catch (error) {
      console.error('Error loading profiles:', error);
      set({ isLoading: false });
    }
  },

  loadActiveProfile: async () => {
    const profileId = await appStorage.getActiveProfileId();
    if (!profileId) {
      set({ activeProfile: null });
      return;
    }

    set({ isLoading: true });
    try {
      const profile = await getProfile(profileId);
      set({ activeProfile: profile, isLoading: false });
    } catch (error) {
      console.error('Error loading active profile:', error);
      set({ activeProfile: null, isLoading: false });
    }
  },

  updateProfileSettings: async (profileId: string, settings: ProfileSettings) => {
    const { activeProfile } = get();
    if (!activeProfile || activeProfile.id !== profileId) {
      return;
    }

    try {
      const currentSettings: ProfileSettings = JSON.parse(activeProfile.settings_json || '{}');
      const updatedSettings = { ...currentSettings, ...settings };
      
      // Update in database would go here
      // For now, update local state
      const updatedProfile: Profile = {
        ...activeProfile,
        settings_json: JSON.stringify(updatedSettings),
      };
      
      set({ activeProfile: updatedProfile });
    } catch (error) {
      console.error('Error updating profile settings:', error);
    }
  },

  initialize: async () => {
    await get().loadProfiles();
    await get().loadActiveProfile();
  },
}));
