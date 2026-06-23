export type PackageCategory = 'massage' | 'facial' | 'body' | 'meditation';

export type PackageStatus = 'draft' | 'active' | 'archived';

export interface WellnessPackage {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  category: PackageCategory;
  status: PackageStatus;
  created_at: string;
  updated_at: string;
}

export type WellnessPackageMobile = Omit<WellnessPackage, 'created_by'>;
