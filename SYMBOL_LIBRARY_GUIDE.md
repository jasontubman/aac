# AAC Symbol Library Integration Guide

## Recommended Symbol Libraries

### ARASAAC (Recommended)
- **Website**: https://arasaac.org
- **License**: CC BY-NC-SA (Creative Commons Attribution-NonCommercial-ShareAlike)
- **Symbols**: ~13,000 pictographic symbols
- **Formats**: Color and black & white, multiple sizes
- **Languages**: Symbols available in multiple languages
- **API**: Available at https://api.arasaac.org

**Usage in App**:
```typescript
import { getARASAACSymbolUrl } from './services/symbolLibrary';

// Get color symbol, 500px
const symbolUrl = getARASAACSymbolUrl(1234, true, 500);

// Get black & white symbol
const symbolUrl = getARASAACSymbolUrl(1234, false, 500);
```

### OpenSymbols
- **Website**: https://www.opensymbols.org
- **License**: Various (aggregates multiple libraries)
- **Symbols**: 60,000+ symbols from multiple sources
- **API**: REST API available for search

### Other Free Options
- **Sclera**: High-contrast symbols (CC BY-NC)
- **Mulberry**: 3,000 symbols (CC BY-SA, unmaintained)
- **Global Symbols**: Culturally-specific symbols (CC BY-SA)

## Implementation Options

### Option 1: Bundle Symbols (Recommended for Core Words)
Download core vocabulary symbols during build and bundle them:
1. Download symbols from ARASAAC API
2. Save to `assets/symbols/` directory
3. Reference as local assets: `require('./assets/symbols/word.png')`

**Pros**: Fast, works offline, no API calls
**Cons**: Larger app size, need to update manually

### Option 2: On-Demand Download with Caching
Download symbols when needed and cache locally:
1. Check local cache first
2. If not found, download from ARASAAC API
3. Cache for future use

**Pros**: Smaller app size, always up-to-date
**Cons**: Requires internet for first use, needs cache management

### Option 3: CDN Service
Use a CDN that hosts AAC symbols:
1. Point to CDN URLs
2. Let CDN handle caching

**Pros**: Fast, reliable, no storage needed
**Cons**: Requires internet, potential costs

## Current Implementation

The app uses **Option 2** (on-demand with caching) for flexibility:

```typescript
// services/symbolLibrary.ts
export function getCoreWordSymbol(word: string): string {
  const symbolId = CORE_SYMBOL_MAPPING[word.toLowerCase()];
  if (symbolId) {
    return getARASAACSymbolUrl(symbolId, true);
  }
  return `asset://symbols/${word.toLowerCase()}.png`; // Fallback
}
```

## Symbol ID Mapping

You'll need to map core vocabulary words to ARASAAC symbol IDs. You can:
1. Search ARASAAC website for each word
2. Use ARASAAC API search endpoint
3. Create a mapping file with word → symbol ID

Example mapping (update with actual ARASAAC IDs):
```typescript
const CORE_SYMBOL_MAPPING: Record<string, number> = {
  'I': 1,
  'you': 2,
  'mom': 4,
  // ... etc
};
```

## Next Steps

1. **Create Symbol Mapping**: Map all core vocabulary words to ARASAAC IDs
2. **Download Core Symbols**: Download and bundle the most common symbols
3. **Implement Caching**: Add local caching for downloaded symbols
4. **Add Symbol Search**: Implement search functionality for custom words

## Legal Considerations

- ARASAAC is free for non-commercial use
- For commercial apps, check license terms
- Always attribute symbol sources
- Consider purchasing commercial licenses (PCS, SymbolStix) for production apps

## Resources

- ARASAAC API Docs: https://api.arasaac.org/docs
- OpenSymbols API: https://www.opensymbols.org/api
- Symbol Search Tool: https://arasaac.org/search
