"use client";

import styles from "./page.module.css";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { packagesApi } from "@/lib/api";
import type { WellnessPackage } from "@/lib/types";

export default function HomePage() {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: packages,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: packagesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: packagesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setDeleteError(null);
    },
    onError: (err: Error) => {
      setDeleteError(err.message);
    },
  });

  const handleDelete = (pkg: WellnessPackage) => {
    if (window.confirm(`Delete "${pkg.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(pkg.id);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Wellness Packages</h1>
        <div className={styles.loading}>Loading packages...</div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Wellness Packages</h1>
        <div className={styles.error}>
          Failed to load packages:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wellness Packages</h1>
        <Link href="/packages/new" className={styles.addButton}>
          + New Package
        </Link>
      </div>

      {deleteError && <div className={styles.error}>{deleteError}</div>}

      {packages && packages.length === 0 ? (
        <div className={styles.empty}>
          No packages yet. Create your first one!
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages?.map((pkg) => (
              <tr key={pkg.id}>
                <td className={styles.nameCell}>{pkg.name}</td>
                <td>
                  <span className={styles.badge}>{pkg.category}</span>
                </td>
                <td>${Number(pkg.price).toFixed(2)}</td>
                <td>{pkg.duration_minutes} min</td>
                <td>
                  <span className={`${styles.status} ${styles[pkg.status]}`}>
                    {pkg.status}
                  </span>
                </td>
                <td className={styles.actions}>
                  <Link
                    href={`/packages/${pkg.id}/edit`}
                    className={styles.editButton}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(pkg)}
                    className={styles.deleteButton}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
