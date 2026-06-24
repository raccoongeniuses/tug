"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { packagesApi, ApiClientError } from "@/lib/api";
import { PackageForm } from "@/components/PackageForm";
import type { PackageFormData } from "@/components/PackageForm";
import styles from "./page.module.css";

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<string[]>([]);

  const id = Number(params.id);

  const {
    data: pkg,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["package", id],
    queryFn: () => packagesApi.getById(id),
    enabled: !isNaN(id),
  });

  const updateMutation = useMutation({
    mutationFn: (dto: Parameters<typeof packagesApi.update>[1]) =>
      packagesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      router.push("/");
    },
    onError: (err: Error) => {
      if (err instanceof ApiClientError) {
        setErrors(err.errors);
      } else {
        setErrors([err.message]);
      }
    },
  });

  const handleSubmit = (data: PackageFormData) => {
    setErrors([]);
    updateMutation.mutate({
      name: data.name,
      description: data.description || undefined,
      image_url: data.image_url || undefined,
      price: parseFloat(data.price),
      duration_minutes: parseInt(data.duration_minutes, 10),
      category: data.category,
      status: data.status,
    });
  };

  if (isLoading) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Edit Package</h1>
        <div className={styles.loading}>Loading package...</div>
      </main>
    );
  }

  if (isError) {
    const is404 =
      error instanceof ApiClientError && error.statusCode === 404;
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Edit Package</h1>
        <div className={styles.error}>
          {is404
            ? "Package not found."
            : `Failed to load package: ${error instanceof Error ? error.message : "Unknown error"}`}
        </div>
        <Link href="/" className={styles.backLink}>
          ← Back to list
        </Link>
      </main>
    );
  }

  if (!pkg) {
    return null;
  }

  const initialData: Partial<PackageFormData> = {
    name: pkg.name,
    description: pkg.description ?? "",
    image_url: pkg.image_url ?? "",
    price: String(pkg.price),
    duration_minutes: String(pkg.duration_minutes),
    category: pkg.category,
    status: pkg.status,
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Package</h1>
        <Link href="/" className={styles.backLink}>
          ← Back to list
        </Link>
      </div>
      <PackageForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errors={errors}
        submitLabel="Update Package"
      />
    </main>
  );
}
