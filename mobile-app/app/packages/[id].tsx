import { Text, StyleSheet, View, Image, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchPackageById } from '../../src/api/client';
import { WellnessPackageMobile } from '../../src/types';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: pkg,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WellnessPackageMobile>({
    queryKey: ['package', id],
    queryFn: () => fetchPackageById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading details…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'Failed to load package details.'}
        </Text>
        <View style={styles.errorActions}>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!pkg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Not found</Text>
        <Text style={styles.errorMessage}>This package could not be found.</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const categoryLabel =
    pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1);

  return (
    <>
      <Stack.Screen options={{ title: pkg.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Image
          source={{ uri: pkg.image_url ?? PLACEHOLDER_IMAGE }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.section}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{categoryLabel}</Text>
            </View>
          </View>

          <Text style={styles.name}>{pkg.name}</Text>

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Price</Text>
              <Text style={styles.price}>${pkg.price.toFixed(2)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.duration}>{pkg.duration_minutes} min</Text>
            </View>
          </View>

          {pkg.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.description}>{pkg.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
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
  errorActions: {
    flexDirection: 'row',
    gap: 12,
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
  backButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f1f5f9',
  },
  section: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7c3aed',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  duration: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  descriptionSection: {
    marginTop: 4,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
});
