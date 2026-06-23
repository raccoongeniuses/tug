"use client";

import { useState } from "react";
import styles from "./PackageForm.module.css";

export interface PackageFormData {
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
  category: "massage" | "facial" | "body" | "meditation";
  status: "draft" | "active" | "archived";
}

interface PackageFormProps {
  initialData?: Partial<PackageFormData>;
  onSubmit: (data: PackageFormData) => void;
  isSubmitting: boolean;
  errors: string[];
  submitLabel: string;
}

const defaultFormData: PackageFormData = {
  name: "",
  description: "",
  price: "",
  duration_minutes: "",
  category: "massage",
  status: "draft",
};

export function PackageForm({
  initialData,
  onSubmit,
  isSubmitting,
  errors,
  submitLabel,
}: PackageFormProps) {
  const [formData, setFormData] = useState<PackageFormData>({
    ...defaultFormData,
    ...initialData,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {errors.length > 0 && (
        <div className={styles.errors}>
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={1}
          maxLength={255}
          value={formData.name}
          onChange={handleChange}
          className={styles.input}
          placeholder="Package name"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={5000}
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Optional description"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="price" className={styles.label}>
            Price *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={styles.input}
            placeholder="0.00"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="duration_minutes" className={styles.label}>
            Duration (min) *
          </label>
          <input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            required
            min="1"
            step="1"
            value={formData.duration_minutes}
            onChange={handleChange}
            className={styles.input}
            placeholder="60"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="massage">Massage</option>
            <option value="facial">Facial</option>
            <option value="body">Body</option>
            <option value="meditation">Meditation</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="status" className={styles.label}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
