import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { WellnessPackageMobile } from '../types';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Image';

interface PackageCardProps {
  pkg: WellnessPackageMobile;
  onPress?: () => void;
}

export default function PackageCard({ pkg, onPress }: PackageCardProps) {
  const categoryLabel =
    pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: pkg.image_url ?? PLACEHOLDER_IMAGE }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {pkg.name}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryLabel}</Text>
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={styles.price}>${pkg.price.toFixed(2)}</Text>
          <Text style={styles.duration}>{pkg.duration_minutes} min</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  body: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    marginRight: 12,
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
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  duration: {
    fontSize: 14,
    color: '#64748b',
  },
});
