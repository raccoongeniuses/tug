import { FlatList, StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { fetchPackages } from '../src/api/client';
import { WellnessPackageMobile } from '../src/types';
import PackageCard from '../src/components/PackageCard';

export default function PackagesListScreen() {
  const router = useRouter();

  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WellnessPackageMobile[]>({
    queryKey: ['packages'],
    queryFn: () => fetchPackages(),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading packages…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'Failed to load packages.'}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No packages available</Text>
        <Text style={styles.emptyMessage}>
          Check back later for new wellness packages.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={packages}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <PackageCard
          pkg={item}
          onPress={() => router.push(`/packages/${item.id}`)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  list: {
    paddingVertical: 16,
  },
});
