import { create } from 'zustand';
import { appStorage } from '../services/storage';
import { getBoard, getButtonsByBoard, getCoreBoard, getBoardsByProfile } from '../database/queries';
import { initializeCoreBoard } from '../utils/coreBoard';
import type { Board, Button } from '../database/types';

interface AACState {
  // Current board
  currentBoard: Board | null;
  currentButtons: Button[];
  
  // Sentence builder
  sentence: Button[];
  sentenceText: string;
  
  // Current routine
  currentRoutineId: string | null;
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  setCurrentBoard: (board: Board | null) => Promise<void>;
  addToSentence: (button: Button) => void;
  clearSentence: () => void;
  speakSentence: () => void;
  setCurrentRoutine: (routineId: string | null) => Promise<void>;
  loadBoardButtons: (boardId: string) => Promise<void>;
  
  // Initialize
  initialize: (activeProfileId?: string) => Promise<void>;
}

export const useAACStore = create<AACState>((set, get) => ({
  currentBoard: null,
  currentButtons: [],
  sentence: [],
  sentenceText: '',
  currentRoutineId: null,
  isLoading: false,

  setCurrentBoard: async (board: Board | null) => {
    set({ currentBoard: board, isLoading: true });
    if (board) {
      await appStorage.setLastBoardId(board.id);
      await get().loadBoardButtons(board.id);
    } else {
      set({ currentButtons: [], isLoading: false });
    }
  },

  loadBoardButtons: async (boardId: string) => {
    set({ isLoading: true });
    try {
      const buttons = await getButtonsByBoard(boardId);
      set({ currentButtons: buttons, isLoading: false });
    } catch (error) {
      console.error('Error loading board buttons:', error);
      set({ currentButtons: [], isLoading: false });
    }
  },

  addToSentence: (button: Button) => {
    const { sentence } = get();
    const newSentence = [...sentence, button];
    const sentenceText = newSentence.map((b) => b.speech_text).join(' ');
    set({ sentence: newSentence, sentenceText });
  },

  clearSentence: () => {
    set({ sentence: [], sentenceText: '' });
  },

  speakSentence: async () => {
    const { sentenceText, sentence } = get();
    // Speech will be handled by the speech service
    // This just clears the sentence after speaking
    if (sentenceText && sentence.length > 0) {
      // Clear after a delay (handled by speech service)
      setTimeout(() => {
        get().clearSentence();
      }, 1000);
    }
  },

  setCurrentRoutine: async (routineId: string | null) => {
    set({ currentRoutineId: routineId });
    await appStorage.setCurrentRoutineId(routineId);
  },

  initialize: async (activeProfileId?: string) => {
    set({ isLoading: true });
    try {
      const lastBoardId = await appStorage.getLastBoardId();
      const currentRoutineId = await appStorage.getCurrentRoutineId();
      
      // Try to load last board
      if (lastBoardId) {
        try {
          const board = await getBoard(lastBoardId);
          if (board) {
            await get().setCurrentBoard(board);
            set({ isLoading: false });
            if (currentRoutineId) {
              await get().setCurrentRoutine(currentRoutineId);
            }
            return;
          }
        } catch (error) {
          console.error('Error loading last board:', error);
        }
      }

      // If no last board and we have a profile, try to load core board
      if (activeProfileId) {
        try {
          // First try to get existing core board
          let board = await getCoreBoard(activeProfileId);
          
          // If no core board exists, create one
          if (!board) {
            const boards = await getBoardsByProfile(activeProfileId);
            if (boards.length === 0) {
              // No boards at all, create core board
              const boardId = await initializeCoreBoard(activeProfileId);
              board = await getBoard(boardId);
            } else {
              // Use first available board
              board = boards[0];
            }
          }
          
          if (board) {
            await appStorage.setLastBoardId(board.id);
            await get().setCurrentBoard(board);
          }
        } catch (error) {
          console.error('Error loading/creating core board:', error);
        }
      }
      
      if (currentRoutineId) {
        await get().setCurrentRoutine(currentRoutineId);
      }
    } catch (error) {
      console.error('Error initializing AAC store:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
