import { useEffect } from 'react';
import { useAACStore } from '../store/aacStore';
import { useProfileStore } from '../store/profileStore';
import { getCoreBoard, getBoardsByProfile } from '../database/queries';

export function useAAC() {
  const {
    currentBoard,
    currentButtons,
    setCurrentBoard,
    loadBoardButtons,
    initialize,
  } = useAACStore();
  const { activeProfile } = useProfileStore();

  useEffect(() => {
    if (activeProfile) {
      loadBoardForProfile(activeProfile.id);
    }
  }, [activeProfile]);

  const loadBoardForProfile = async (profileId: string) => {
    try {
      // Try to get core board first
      let board = await getCoreBoard(profileId);
      
      // If no core board exists, get first available board
      if (!board) {
        const boards = await getBoardsByProfile(profileId);
        board = boards[0] || null;
      }

      if (board) {
        await setCurrentBoard(board);
      }
    } catch (error) {
      console.error('Error loading board:', error);
    }
  };

  return {
    currentBoard,
    currentButtons,
    setCurrentBoard,
    loadBoardButtons,
  };
}
