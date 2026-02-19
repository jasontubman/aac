import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { searchSymbols, getARASAACSymbolUrl, type SymbolResult } from '../../services/symbolLibrary';

interface SymbolPickerProps {
  visible: boolean;
  onSelect: (symbol: SymbolResult) => void;
  onCancel: () => void;
  searchKeyword?: string;
}

export const SymbolPicker: React.FC<SymbolPickerProps> = ({
  visible,
  onSelect,
  onCancel,
  searchKeyword = '',
}) => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState(searchKeyword);
  const [symbols, setSymbols] = useState<SymbolResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && searchKeyword) {
      setSearchText(searchKeyword);
      performSearch(searchKeyword);
    } else if (visible) {
      // Initial search with common words
      performSearch('hello');
    }
  }, [visible]);

  useEffect(() => {
    // Debounce search
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (searchText.length >= 2) {
      const timer = setTimeout(() => {
        performSearch(searchText);
      }, 500);
      setDebounceTimer(timer);
    } else if (searchText.length === 0) {
      setSymbols([]);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchText]);

  const performSearch = async (keyword: string) => {
    if (!keyword || keyword.trim().length < 2) {
      setSymbols([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchSymbols(keyword.trim());
      setSymbols(results);
    } catch (error) {
      console.error('Error searching symbols:', error);
      Alert.alert('Error', 'Failed to search symbols. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (symbol: SymbolResult) => {
    onSelect(symbol);
  };

  const renderSymbolItem = ({ item }: { item: SymbolResult }) => (
    <TouchableOpacity
      style={styles.symbolItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.symbolImage}
        resizeMode="contain"
      />
      <Text style={styles.symbolName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Symbol</Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search symbols (e.g., 'happy', 'eat', 'play')..."
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(searchText)}
          />
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Searching symbols...</Text>
          </View>
        )}

        {/* Results */}
        {!isLoading && symbols.length === 0 && searchText.length >= 2 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No symbols found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        )}

        {!isLoading && searchText.length < 2 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Type at least 2 characters to search</Text>
          </View>
        )}

        {/* Symbol Grid */}
        {!isLoading && symbols.length > 0 && (
          <FlatList
            data={symbols}
            renderItem={renderSymbolItem}
            keyExtractor={(item) => `symbol-${item.id}`}
            numColumns={3}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={true}
          />
        )}

        {/* Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>
            Symbols provided by ARASAAC (CC BY-NC-SA)
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
  },
  cancelButton: {
    padding: spacing.xs,
  },
  cancelButtonText: {
    ...typography.body.medium,
    color: colors.primary[600],
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  searchInput: {
    ...typography.body.medium,
    backgroundColor: colors.neutral[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body.small,
    color: colors.text.tertiary,
  },
  grid: {
    padding: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  symbolItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  symbolImage: {
    width: '80%',
    height: '70%',
    marginBottom: spacing.xs,
  },
  symbolName: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 10,
  },
  attribution: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  attributionText: {
    ...typography.body.small,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontSize: 10,
  },
});
