# Tug — Wellness Package Management System

A vertical slice prototype of a Wellness Package Management System across three surfaces: a NestJS backend API, a Next.js admin portal, and a React Native (Expo) mobile app. See [`docs/assessment.md`](docs/assessment.md) for the full assessment prompt and [`docs/plan.md`](docs/plan.md) for the architecture design document.

## Repo structure

```
/backend          — NestJS 11.1.x + TypeScript + MySQL (API server)
/admin-portal     — Next.js 16.2.x App Router (admin CRUD)
/mobile-app       — React Native + Expo SDK 55 (read-only browse)
/docs             — design doc, database schema, progress tracker
/scripts          — utility scripts (PDF extraction, etc.)
```

## Prerequisites

- **Node.js** 20.11+ and **npm** 10+
- **MySQL** 9.7 LTS (or use Docker — see Quick start below)
- **Expo Go** app (iOS/Android) and **Expo CLI** — for mobile development
- **Docker** + **Docker Compose v2** — for one-command spin-up

## Quick start (Docker — one command)

```bash
docker compose up --build
```

This brings up three services:

| Service | URL | Notes |
|---------|-----|-------|
| Admin Portal | http://localhost:3000 | Next.js CRUD interface |
| Backend API | http://localhost:4000 | NestJS REST API |
| Swagger UI | http://localhost:4000/api/docs | OpenAPI docs |
| MySQL | localhost:3306 | DB (credentials: `tug` / `tug`) |

The mobile app runs **outside Docker** via Expo (see [Manual setup](#manual-setup-without-docker) below or run `cd mobile-app && npm start`). Point `EXPO_PUBLIC_API_URL` at your machine's LAN IP and port 4000.

On first start, TypeORM auto-creates the `wellness_packages` table from the entity definition (`synchronize: true`).

## Manual setup (without Docker)

### Backend

```bash
cd backend
cp .env.example .env          # fill in your DB credentials
npm install
npm run start:dev             # → http://localhost:4000
```

Swagger UI available at [`http://localhost:4000/api/docs`](http://localhost:4000/api/docs).

### Admin Portal

```bash
cd admin-portal
cp .env.local.example .env.local
npm install
npm run dev                   # → http://localhost:3000
```

### Mobile App

```bash
cd mobile-app
cp .env.example .env          # use your LAN IP for EXPO_PUBLIC_API_URL
npm install
npm start                     # scan QR with Expo Go
```

For physical devices, set `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:4000` in `.env` — `localhost` won't resolve on a phone.

## API reference

All endpoints are prefixed with the appropriate sub-path. See Swagger at `/api/docs` for interactive documentation.

| Method | Path | Description | Status codes |
|--------|------|-------------|-------------|
| GET | `/admin/packages` | List all packages | 200 |
| GET | `/admin/packages/:id` | Get one package | 200, 404 |
| POST | `/admin/packages` | Create a package | 201, 400 |
| PUT | `/admin/packages/:id` | Update a package | 200, 400, 404 |
| DELETE | `/admin/packages/:id` | Delete a package | 204, 404 |
| GET | `/mobile/packages` | List active packages (`?category=` optional) | 200 |
| GET | `/mobile/packages/:id` | Get one active package | 200, 404 |

Error responses follow a consistent shape:

```json
{
  "statusCode": 400,
  "message": ["name should not be empty"],
  "error": "Bad Request"
}
```

## Data model

The `WellnessPackage` entity contains:

| Field | Type | Notes |
|-------|------|-------|
| `id` | INT (PK, auto-increment) | Surrogate key |
| `name` | VARCHAR(255) | Required, 1–255 chars |
| `description` | TEXT | Optional, ≤ 5000 chars |
| `price` | DECIMAL(10,2) | Required, > 0 |
| `duration_minutes` | INT | Required, > 0 |
| `image_url` | VARCHAR(500) | Optional |
| `category` | ENUM (`massage`/`facial`/`body`/`meditation`) | Default: `massage` |
| `status` | ENUM (`draft`/`active`/`archived`) | Default: `draft` |
| `created_at` | DATETIME(3) | Auto-set on create |
| `updated_at` | DATETIME(3) | Auto-updated on change |
| `created_by` | VARCHAR(255) | Optional (no auth yet) |

Full DDL and indexing details in [`docs/database.md`](docs/database.md).

## Testing

```bash
cd backend
npm test
```

Runs Jest unit tests on the service layer. No integration or E2E tests are included in this prototype.

## Notes & known limitations

- **No authentication** — admin endpoints are unprotected. In production, add JWT-based auth with role guards. See [`docs/plan.md` §4.4](docs/plan.md).
- **No pagination** — all endpoints return the full list. Fine for prototype scale (< 1000 packages).
- **Mobile is read-only** — all mutations go through the admin portal.
- **Hard delete** — no soft-delete. `archived` status provides a soft-hide mechanism.
- **Single-currency** — all prices assumed in one currency. No `price_currency` column.
- Full trade-off discussion in [`docs/plan.md` §4](docs/plan.md).

## Bonus items completed

- [x] Docker / docker-compose for one-command spin-up
- [x] Swagger / OpenAPI docs
- [x] Unit tests on service layer
- [x] Environment config (`.env.example` files per surface)
- [ ] Screenshots (admin, mobile, sample API response) — deferred

## AI workflow

Development was assisted by OpenCode (CLI) and GitHub Copilot (in-editor). See [`docs/plan.md` §5](docs/plan.md) for the full AI workflow documentation.
