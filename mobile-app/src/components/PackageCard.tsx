import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { WellnessPackageMobile } from '../types';
import { colors, borderRadius } from '../theme';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x200/F0FDFA/0D9488?text=Wellness';

const CATEGORY_ICONS: Record<string, string> = {
  massage: '💆',
  facial: '🧖',
  body: '🧘',
  meditation: '🕯️',
};

interface PackageCardProps {
  pkg: WellnessPackageMobile;
  onPress?: () => void;
}

export default function PackageCard({ pkg, onPress }: PackageCardProps) {
  const categoryLabel =
    pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <Image
        source={{ uri: pkg.image_url ?? PLACEHOLDER_IMAGE }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>
            {CATEGORY_ICONS[pkg.category] || '•'}
          </Text>
          <Text style={styles.badgeText}>{categoryLabel}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {pkg.name}
        </Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Price</Text>
            <Text style={styles.price}>${pkg.price.toFixed(2)}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.duration}>{pkg.duration_minutes} min</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.primaryBg,
  },
  overlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  body: {
    padding: 14,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  duration: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.border,
  },
});
