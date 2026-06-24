export interface WellnessPackage {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  category: "massage" | "facial" | "body" | "meditation";
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreatePackageDto {
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  duration_minutes: number;
  category?: "massage" | "facial" | "body" | "meditation";
  status?: "draft" | "active" | "archived";
}

export interface UpdatePackageDto {
  name?: string;
  description?: string;
  image_url?: string;
  price?: number;
  duration_minutes?: number;
  category?: "massage" | "facial" | "body" | "meditation";
  status?: "draft" | "active" | "archived";
}

export interface ApiError {
  statusCode: number;
  message: string[];
  error: string;
}
