# Database Design

## DBMS

- **MySQL 9.7 LTS** (UTF-8, `utf8mb4`)
- **Engine:** InnoDB (default on MySQL 9.x)

## Tables

### `wellness_packages`

Core domain entity. Extended from the assessment's base fields with `image_url`, `category`, `status`, `updated_at`, and `created_by` (see `docs/plan.md` §3).

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT, UNSIGNED | — | Surrogate key |
| `name` | VARCHAR(255) | NOT NULL | — | 1–255 chars (validated in DTO) |
| `description` | TEXT | NULL | NULL | ≤ 5000 chars (validated in DTO) |
| `price` | DECIMAL(10,2) | NOT NULL | — | Currency; 10 digits, 2 decimals |
| `duration_minutes` | INT | NOT NULL, UNSIGNED | — | > 0 (validated in DTO) |
| `image_url` | VARCHAR(500) | NULL | NULL | Display image on mobile/admin |
| `category` | ENUM('massage','facial','body','meditation') | NOT NULL | 'massage' | Drives mobile filtering |
| `status` | ENUM('draft','active','archived') | NOT NULL | 'draft' | Soft-hide / lifecycle control |
| `created_at` | DATETIME(3) | NOT NULL | CURRENT_TIMESTAMP(3) | Audit |
| `updated_at` | DATETIME(3) | NOT NULL | CURRENT_TIMESTAMP(3) | `ON UPDATE CURRENT_TIMESTAMP(3)` |
| `created_by` | VARCHAR(255) | NULL | NULL | Admin identity (no auth yet; nullable) |

### Columns deliberately excluded

- No `deleted_at` column — hard delete only for the prototype. Soft-delete + `archived` status covers the lifecycle use case.
- No separate `categories` table — single enum is sufficient at this scale. Promote to a table if packages need multi-category assignment at production scale.
- No `price_currency` column — implicit assumption: all packages priced in a single currency. Add (or normalize to ISO 4217) if multi-currency is required.

## Indexes

| Name | Columns | Purpose |
|---|---|---|
| `PRIMARY` | `id` | Row lookups by PK |
| `idx_packages_status` | `status` | Mobile list query: `WHERE status = 'active'` |
| `idx_packages_category` | `category` | Filter by category on mobile |
| `idx_packages_created_at` | `created_at` | Default ordering (newest first) |

> **Note:** At production scale, replace separate `status` and `category` indexes with a single composite index `idx_packages_status_category (status, category)` since both are always queried together by mobile. Keep them separate at prototype scale for flexibility.

## Relationships

None for the prototype — single entity with no foreign keys. Future schema additions worth planning for:

- `admin_users` (id, email, role, created_at) — replace nullable `created_by` string column with a proper FK.
- `bookings` (id, user_id, package_id, scheduled_at, status) — when browse → book flow is added.
- `package_images` (id, package_id, url, position) — if multi-image support is required.

## DDL

```sql
CREATE DATABASE IF NOT EXISTS tug
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tug;

CREATE TABLE wellness_packages (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  description     TEXT NULL,
  price           DECIMAL(10,2) NOT NULL,
  duration_minutes INT UNSIGNED NOT NULL,
  image_url       VARCHAR(500) NULL,
  category        ENUM('massage','facial','body','meditation') NOT NULL DEFAULT 'massage',
  status          ENUM('draft','active','archived') NOT NULL DEFAULT 'draft',
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  created_by      VARCHAR(255) NULL,
  PRIMARY KEY (id),
  INDEX idx_packages_status (status),
  INDEX idx_packages_category (category),
  INDEX idx_packages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## OR / Migration approach

- **Prototype:** Use TypeORM with `synchronize: true` in dev to auto-create tables from the entity.
- **Production paths:** Disable `synchronize`, use a migration tool (TypeORM migrations or Prisma Migrate) with versioned SQL files under `backend/migrations/`. Seed data lives in `backend/src/seed/`.
- **Docker dev:** MySQL service in `docker-compose.yml` with a named volume; DB resets via `docker compose down -v` then `up`.