import { WellnessPackageMobile } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError('Not found', 404);
    }
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export function fetchPackages(category?: string): Promise<WellnessPackageMobile[]> {
  const params = new URLSearchParams();
  if (category) {
    params.set('category', category);
  }
  const queryString = params.toString();
  const path = `/mobile/packages${queryString ? `?${queryString}` : ''}`;
  return request<WellnessPackageMobile[]>(path);
}

export function fetchPackageById(id: number): Promise<WellnessPackageMobile> {
  return request<WellnessPackageMobile>(`/mobile/packages/${id}`);
}

export { ApiError };
