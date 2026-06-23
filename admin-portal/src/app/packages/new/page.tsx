"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { packagesApi, ApiClientError } from "@/lib/api";
import { PackageForm } from "@/components/PackageForm";
import type { PackageFormData } from "@/components/PackageForm";
import styles from "./page.module.css";

export default function NewPackagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: packagesApi.create,
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
    createMutation.mutate({
      name: data.name,
      description: data.description || undefined,
      price: parseFloat(data.price),
      duration_minutes: parseInt(data.duration_minutes, 10),
      category: data.category,
      status: data.status,
    });
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>New Package</h1>
        <Link href="/" className={styles.backLink}>
          ← Back to list
        </Link>
      </div>
      <PackageForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        errors={errors}
        submitLabel="Create Package"
      />
    </main>
  );
}
