import {
  Text,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchPackageById } from '../../src/api/client';
import { WellnessPackageMobile } from '../../src/types';
import { colors, borderRadius, spacing } from '../../src/theme';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/F0FDFA/0D9488?text=Wellness';

const CATEGORY_ICONS: Record<string, string> = {
  massage: '💆',
  facial: '🧖',
  body: '🧘',
  meditation: '🕯️',
};

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error
            ? error.message
            : 'Failed to load package details.'}
        </Text>
        <View style={styles.errorActions}>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!pkg) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>?</Text>
        </View>
        <Text style={styles.errorTitle}>Not found</Text>
        <Text style={styles.errorMessage}>
          This package could not be found.
        </Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: pkg.image_url ?? PLACEHOLDER_IMAGE }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>
                {CATEGORY_ICONS[pkg.category] || '•'}
              </Text>
              <Text style={styles.badgeText}>{categoryLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.name}>{pkg.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Price</Text>
              <Text style={styles.price}>${pkg.price.toFixed(2)}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.duration}>
                {pkg.duration_minutes} min
              </Text>
            </View>
          </View>

          {pkg.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>About this package</Text>
              <Text style={styles.description}>{pkg.description}</Text>
            </View>
          ) : null}

          <View style={styles.bookSection}>
            <Pressable style={styles.bookButton}>
              <Text style={styles.bookButtonText}>
                Book ${pkg.price.toFixed(2)} session
              </Text>
            </Pressable>
          </View>
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
    backgroundColor: colors.background,
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
  errorActions: {
    flexDirection: 'row',
    gap: 12,
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
  backButton: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: colors.primaryBg,
  },
  imageOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metaCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  duration: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  descriptionSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bookSection: {
    paddingTop: spacing.sm,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
