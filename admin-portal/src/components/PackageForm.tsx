"use client";

import { useState } from "react";
import styles from "./PackageForm.module.css";

export interface PackageFormData {
  name: string;
  description: string;
  image_url: string;
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
  image_url: "",
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
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Information</h2>
        <p className={styles.sectionDesc}>Name and description for the package</p>

        {errors.length > 0 && (
          <div className={styles.errors}>
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Name <span className={styles.required}>*</span>
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
            placeholder="e.g. Swedish Massage"
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
            placeholder="Describe what this package includes..."
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Media</h2>
        <p className={styles.sectionDesc}>Package image URL</p>

        <div className={styles.field}>
          <label htmlFor="image_url" className={styles.label}>
            Image URL
          </label>
          <div className={styles.inputWithPreview}>
            <input
              id="image_url"
              name="image_url"
              type="url"
              maxLength={500}
              value={formData.image_url}
              onChange={handleChange}
              className={styles.input}
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div className={styles.preview}>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className={styles.previewImg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="hidden" style={{ display: "none" }}>
                  Preview unavailable
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pricing & Duration</h2>
        <p className={styles.sectionDesc}>Set the price and length of the package</p>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="price" className={styles.label}>
              Price <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputGroup}>
              <span className={styles.inputPrefix}>$</span>
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
          </div>

          <div className={styles.field}>
            <label htmlFor="duration_minutes" className={styles.label}>
              Duration <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputGroup}>
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
              <span className={styles.inputSuffix}>min</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Classification</h2>
        <p className={styles.sectionDesc}>Category and status settings</p>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="category" className={styles.label}>
              Category
            </label>
            <div className={styles.selectWrapper}>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="massage">💆 Massage</option>
                <option value="facial">🧖 Facial</option>
                <option value="body">🧘 Body</option>
                <option value="meditation">🕯️ Meditation</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="status" className={styles.label}>
              Status
            </label>
            <div className={styles.selectWrapper}>
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
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <span className={styles.submitting}>
              <span className={styles.spinner} />
              Saving...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
