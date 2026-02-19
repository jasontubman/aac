import { generateId } from './id';
import { createBoard, createButton } from '../database/queries';
import { CORE_VOCABULARY } from './constants';
import { getCoreWordSymbol } from '../services/symbolLibrary';

// Core vocabulary words organized by category
const CORE_WORDS_BY_CATEGORY = {
  people: ['I', 'you', 'me', 'mom', 'dad', 'help'],
  actions: ['want', 'need', 'go', 'stop', 'more', 'done', 'yes', 'no'],
  objects: ['water', 'food', 'bathroom', 'toilet'],
  feelings: ['happy', 'sad', 'hurt', 'tired'],
  places: ['home', 'school'],
  time: ['now', 'later'],
};

// Initialize core board for a profile
export async function initializeCoreBoard(profileId: string): Promise<string> {
  const boardId = generateId();
  const now = Date.now();

  // Create core board (4x4 grid)
  await createBoard(boardId, profileId, 'Core Words', true, 4, 4);

  // Add core vocabulary buttons
  const allWords = Object.values(CORE_WORDS_BY_CATEGORY).flat();
  const limitedWords = allWords.slice(0, 16); // 4x4 = 16 buttons max

  for (let i = 0; i < limitedWords.length; i++) {
    const word = limitedWords[i];
    const buttonId = generateId();
      // Get symbol URL from ARASAAC or fallback
      const symbolUrl = getCoreWordSymbol(word);
      
      await createButton(
        buttonId,
        boardId,
        word,
        word, // Speech text same as label for core words
        symbolUrl, // ARASAAC symbol URL or fallback
        i,
        null, // No additional symbol
        null // Default color
      );
  }

  return boardId;
}
