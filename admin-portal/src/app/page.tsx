"use client";

import styles from "./page.module.css";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { packagesApi } from "@/lib/api";
import type { WellnessPackage } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  massage: "💆",
  facial: "🧖",
  body: "🧘",
  meditation: "🕯️",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={styles.categoryBadge}>
      {CATEGORY_ICONS[category] || "•"} {category}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonLine} style={{ width: "40%" }} />
          <div className={styles.skeletonLine} style={{ width: "25%", height: 12 }} />
          <div className={styles.skeletonRow}>
            <div className={styles.skeletonLine} style={{ width: "20%" }} />
            <div className={styles.skeletonLine} style={{ width: "15%" }} />
            <div className={styles.skeletonLine} style={{ width: "18%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: packagesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: packagesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setDeleteError(null);
      setDeletingId(null);
    },
    onError: (err: Error) => {
      setDeleteError(err.message);
      setDeletingId(null);
    },
  });

  const handleDelete = (pkg: WellnessPackage) => {
    if (window.confirm(`Delete "${pkg.name}"? This cannot be undone.`)) {
      setDeletingId(pkg.id);
      deleteMutation.mutate(pkg.id);
    }
  };

  const statuses = ["all", "active", "draft", "archived"];
  const filteredPackages = packages?.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Packages</h1>
          <p className={styles.subtitle}>
            {packages ? `${packages.length} total packages` : "Manage your wellness offerings"}
          </p>
        </div>
        <Link href="/packages/new" className={styles.addButton}>
          <span>+</span> New Package
        </Link>
      </div>

      {deleteError && (
        <div className={styles.errorBanner}>
          <span>✕</span> {deleteError}
        </div>
      )}

      <div className={styles.filters}>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ""}`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSkeleton />}

      {isError && !isLoading && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>!</div>
          <h3>Failed to load packages</h3>
          <p>{error instanceof Error ? error.message : "Unknown error"}</p>
          <button onClick={() => refetch()} className={styles.retryBtn}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && filteredPackages && filteredPackages.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            {statusFilter !== "all" ? "📭" : "✨"}
          </div>
          <h3>
            {statusFilter !== "all"
              ? `No ${statusFilter} packages`
              : "No packages yet"}
          </h3>
          <p>
            {statusFilter !== "all"
              ? "Try a different filter"
              : "Create your first wellness package to get started."}
          </p>
          {statusFilter === "all" && (
            <Link href="/packages/new" className={styles.addButton}>
              + New Package
            </Link>
          )}
        </div>
      )}

      {!isLoading && !isError && filteredPackages && filteredPackages.length > 0 && (
        <div className={styles.grid}>
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`${styles.card} ${deletingId === pkg.id ? styles.cardDeleting : ""}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardName}>{pkg.name}</h3>
                  <StatusBadge status={pkg.status} />
                </div>
                <CategoryBadge category={pkg.category} />
              </div>

              <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Price</span>
                  <span className={styles.metaValue}>
                    ${Number(pkg.price).toFixed(2)}
                  </span>
                </div>
                <div className={styles.metaDivider} />
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Duration</span>
                  <span className={styles.metaValue}>
                    {pkg.duration_minutes} min
                  </span>
                </div>
                <div className={styles.metaDivider} />
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Updated</span>
                  <span className={styles.metaValue}>
                    {new Date(pkg.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <Link
                  href={`/packages/${pkg.id}/edit`}
                  className={styles.editBtn}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(pkg)}
                  className={styles.deleteBtn}
                  disabled={deleteMutation.isPending && deletingId === pkg.id}
                >
                  {deleteMutation.isPending && deletingId === pkg.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
