/**
 * AAC Symbol Library Service
 * 
 * Integrates with free/open-source AAC symbol libraries:
 * - ARASAAC (arasaac.org) - ~13,000 symbols, CC BY-NC-SA license
 * - OpenSymbols API - Aggregates multiple libraries
 * 
 * For production, you can:
 * 1. Download symbols during app build and bundle them
 * 2. Download on-demand and cache locally
 * 3. Use a CDN service
 */

// ARASAAC API base URL
const ARASAAC_API_BASE = 'https://api.arasaac.org/api/pictograms';

// Symbol mapping for core vocabulary
const CORE_SYMBOL_MAPPING: Record<string, number> = {
  // People
  'I': 1, // Example ID - replace with actual ARASAAC IDs
  'you': 2,
  'me': 3,
  'mom': 4,
  'dad': 5,
  'help': 6,
  
  // Actions
  'want': 7,
  'need': 8,
  'go': 9,
  'stop': 10,
  'more': 11,
  'done': 12,
  'yes': 13,
  'no': 14,
  
  // Objects
  'water': 15,
  'food': 16,
  'bathroom': 17,
  'toilet': 18,
  
  // Feelings
  'happy': 19,
  'sad': 20,
  'hurt': 21,
  'tired': 22,
  
  // Places
  'home': 23,
  'school': 24,
  
  // Time
  'now': 25,
  'later': 26,
};

/**
 * Get ARASAAC symbol URL
 * @param symbolId - ARASAAC pictogram ID
 * @param color - true for color, false for black & white
 * @param size - Image size (500, 1000, etc.)
 */
export function getARASAACSymbolUrl(
  symbolId: number,
  color: boolean = true,
  size: number = 500
): string {
  const colorParam = color ? 'color' : 'bw';
  return `${ARASAAC_API_BASE}/${symbolId}?download=false&color=${colorParam}&size=${size}`;
}

/**
 * Get symbol URL for a word
 * Falls back to placeholder if symbol not found
 */
export function getSymbolUrl(word: string, color: boolean = true): string {
  const symbolId = CORE_SYMBOL_MAPPING[word.toLowerCase()];
  if (symbolId) {
    return getARASAACSymbolUrl(symbolId, color);
  }
  
  // Fallback: use OpenSymbols search API or placeholder
  // For now, return placeholder
  return `asset://symbols/${word.toLowerCase()}.png`;
}

/**
 * Search for symbols by keyword using ARASAAC API
 * ARASAAC search endpoint: https://api.arasaac.org/api/pictograms/es/search/{keyword}
 */
export async function searchSymbols(keyword: string, locale: string = 'en'): Promise<Array<{
  id: number;
  name: string;
  imageUrl: string;
  source: string;
}>> {
  if (!keyword || keyword.trim().length === 0) {
    return [];
  }

  try {
    // ARASAAC search API - supports multiple locales
    // Using 'es' (Spanish) as it has the most symbols, but we can search in any language
    const searchUrl = `https://api.arasaac.org/api/pictograms/${locale}/search/${encodeURIComponent(keyword.trim())}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.warn('ARASAAC search failed:', response.status);
      return [];
    }

    const data = await response.json();
    
    // ARASAAC returns an array of pictogram objects
    if (!Array.isArray(data)) {
      return [];
    }

    return data.slice(0, 50).map((pictogram: any) => ({
      id: pictogram._id,
      name: pictogram.keywords?.[0]?.keyword || keyword,
      imageUrl: getARASAACSymbolUrl(pictogram._id, true, 500),
      source: 'ARASAAC',
    }));
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}

/**
 * Download and cache symbol locally
 */
export async function downloadAndCacheSymbol(
  symbolUrl: string,
  filename: string
): Promise<string> {
  // Implementation would:
  // 1. Download image from URL
  // 2. Save to local cache directory
  // 3. Return local file path
  
  // For now, return the URL (would be cached path in production)
  return symbolUrl;
}

/**
 * Get symbol for core vocabulary word
 * Returns URL that can be used in Image component
 */
export function getCoreWordSymbol(word: string): string {
  return getSymbolUrl(word, true);
}

/**
 * Get symbol by ARASAAC ID
 */
export function getSymbolById(symbolId: number, color: boolean = true, size: number = 500): string {
  return getARASAACSymbolUrl(symbolId, color, size);
}

export interface SymbolResult {
  id: number;
  name: string;
  imageUrl: string;
  source: string;
}
