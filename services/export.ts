/**
 * Export Service
 * 
 * Exports all profile data as JSON for backup/portability
 */

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  getProfile,
  getBoardsByProfile,
  getButtonsByBoard,
  getRoutinesByProfile,
  getMediaAssetsByProfile,
} from '../database/queries';
import type { Profile, Board, Button, Routine, MediaAsset } from '../database/types';

export interface ExportData {
  version: string;
  exportDate: string;
  profile: Profile;
  boards: Board[];
  buttons: Button[];
  routines: Routine[];
  mediaAssets: MediaAsset[];
}

/**
 * Export all data for a profile
 */
export async function exportProfileData(profileId: string): Promise<string> {
  try {
    // Fetch all data
    const profile = await getProfile(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const boards = await getBoardsByProfile(profileId);
    const routines = await getRoutinesByProfile(profileId);
    const mediaAssets = await getMediaAssetsByProfile(profileId);

    // Get all buttons for all boards
    const allButtons: Button[] = [];
    for (const board of boards) {
      const buttons = await getButtonsByBoard(board.id);
      allButtons.push(...buttons);
    }

    // Create export data structure
    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      profile,
      boards,
      buttons: allButtons,
      routines,
      mediaAssets,
    };

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);

    // Save to file
    const fileName = `aac-export-${profile.name}-${Date.now()}.json`;
    const file = new File(Paths.document, fileName);
    
    // Write file with UTF8 encoding
    file.write(jsonString);

    return file.uri;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

/**
 * Share exported data
 */
export async function shareExportedData(fileUri: string): Promise<void> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
}

/**
 * Export and share profile data
 */
export async function exportAndShareProfileData(profileId: string): Promise<void> {
  const fileUri = await exportProfileData(profileId);
  await shareExportedData(fileUri);
}
