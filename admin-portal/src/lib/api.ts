const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

import type { WellnessPackage, CreatePackageDto, UpdatePackageDto, ApiError } from "./types";

class ApiClientError extends Error {
  statusCode: number;
  errors: string[];

  constructor(apiError: ApiError) {
    const errorMessage = Array.isArray(apiError.message)
      ? apiError.message.join(", ")
      : apiError.message;
    super(errorMessage);
    this.name = "ApiClientError";
    this.statusCode = apiError.statusCode;
    this.errors = Array.isArray(apiError.message) ? apiError.message : [apiError.message];
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let apiError: ApiError;
    try {
      apiError = await response.json();
    } catch {
      throw new Error(`Request failed with status ${response.status}`);
    }
    throw new ApiClientError(apiError);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const packagesApi = {
  getAll: () => request<WellnessPackage[]>("/admin/packages"),

  getById: (id: number) => request<WellnessPackage>(`/admin/packages/${id}`),

  create: (dto: CreatePackageDto) =>
    request<WellnessPackage>("/admin/packages", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: UpdatePackageDto) =>
    request<WellnessPackage>(`/admin/packages/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  delete: (id: number) =>
    request<void>(`/admin/packages/${id}`, {
      method: "DELETE",
    }),
};

export { ApiClientError };
