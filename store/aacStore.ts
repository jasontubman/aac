import { create } from 'zustand';
import { appStorage } from '../services/storage';
import { getBoard, getButtonsByBoard } from '../database/queries';
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
  setCurrentRoutine: (routineId: string | null) => void;
  loadBoardButtons: (boardId: string) => Promise<void>;
  
  // Initialize
  initialize: () => Promise<void>;
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
      appStorage.setLastBoardId(board.id);
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

  setCurrentRoutine: (routineId: string | null) => {
    set({ currentRoutineId: routineId });
    appStorage.setCurrentRoutineId(routineId);
  },

  initialize: async () => {
    const lastBoardId = appStorage.getLastBoardId();
    const currentRoutineId = appStorage.getCurrentRoutineId();
    
    if (lastBoardId) {
      try {
        const board = await getBoard(lastBoardId);
        if (board) {
          await get().setCurrentBoard(board);
        }
      } catch (error) {
        console.error('Error loading last board:', error);
      }
    }
    
    if (currentRoutineId) {
      get().setCurrentRoutine(currentRoutineId);
    }
  },
}));
