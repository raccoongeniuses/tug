import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { fetchPackages } from '../src/api/client';
import { WellnessPackageMobile } from '../src/types';
import PackageCard from '../src/components/PackageCard';
import { colors, borderRadius, spacing } from '../src/theme';

const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '✨' },
  { key: 'massage', label: 'Massage', icon: '💆' },
  { key: 'facial', label: 'Facial', icon: '🧖' },
  { key: 'body', label: 'Body', icon: '🧘' },
  { key: 'meditation', label: 'Meditation', icon: '🕯️' },
];

export default function PackagesListScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<WellnessPackageMobile[]>({
    queryKey: ['packages', selectedCategory],
    queryFn: () =>
      fetchPackages(selectedCategory === 'all' ? undefined : selectedCategory),
  });

  const filteredPackages = packages;
  const hasPackages =
    filteredPackages && filteredPackages.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterChip,
                selectedCategory === item.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  selectedCategory === item.key && styles.filterLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding wellness packages...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error
              ? error.message
              : 'Failed to load packages.'}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : !hasPackages ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>
            {selectedCategory !== 'all' ? '📭' : '✨'}
          </Text>
          <Text style={styles.emptyTitle}>
            {selectedCategory !== 'all'
              ? `No ${selectedCategory} packages`
              : 'No packages available'}
          </Text>
          <Text style={styles.emptyMessage}>
            {selectedCategory !== 'all'
              ? 'Try a different category'
              : 'Check back later for new wellness offerings.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPackages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <PackageCard
              pkg={item}
              onPress={() => router.push(`/packages/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterList: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterIcon: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.error,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingVertical: spacing.sm,
    paddingBottom: 32,
  },
});
