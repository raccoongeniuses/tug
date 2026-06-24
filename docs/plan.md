# Plan — Wellness Package Management System

## Pinned Versions

| Framework | Version |
|-----------|---------|
| NestJS | 11.1.x |
| Next.js | 16.2.x |
| Expo SDK | 55.x |
| React Query | 5.101.x |
| TypeScript | 6.0.x |
| MySQL | 9.7 LTS |

## 1. Problem Framing & Scope

### What I'm building

A vertical slice of a Wellness Package Management System across three surfaces:

- **Backend API** (NestJS + TypeScript + MySQL) — serves both admin portal and mobile app
- **Admin Portal** (Next.js + TypeScript) — CRUD for wellness packages
- **Mobile App** (React Native + Expo + TypeScript) — browse available packages

### What I'm deliberately leaving out

- Authentication / authorization — stubbed for now; would add JWT + roles in production
- User management — out of scope for this assessment
- Payments / checkout — the domain is package browsing only
- Pagination, search, filtering — single-page list is sufficient for the prototype
- CI/CD — Docker Compose for local dev only
- Comprehensive test coverage — a handful of unit tests on the service layer

### Assumptions

- Low scale (< 1000 packages, < 100 concurrent users) — no caching or read replicas needed
- Single admin user — no multi-tenant concerns
- Mobile app is read-only — all mutations happen via admin portal
- MySQL is the required database — schema designed accordingly

## 2. Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Admin Portal   │────▶│  Backend API     │◀────│  Mobile App     │
│  (Next.js)      │     │  (NestJS)        │     │  (Expo/RN)      │
│  localhost:3000  │     │  localhost:4000   │     │  device/expo    │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  MySQL           │
                        │  localhost:3306   │
                        └──────────────────┘
```

### Code organization

```
/backend
├── src/
│   ├── packages/       # module: controller, service, DTOs, entity
│   ├── common/         # shared guards, filters, interceptors
│   └── main.ts
├── ormconfig.ts
└── package.json

/admin-portal
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # UI components
│   ├── lib/            # API client, types
│   └── providers/
└── package.json

/mobile-app
├── src/
│   ├── screens/
│   ├── components/
│   ├── api/            # API client
│   └── types/
└── package.json
```

### Shared concerns

- **Types** — a `shared-types` package or duplicated TypeScript interfaces across repos. For a monorepo, a `packages/shared` workspace.
- **Validation** — class-validator DTOs on the backend; zod on the frontend (or reuse class-validator via `nestjs-zod`)
- **Error handling** — NestJS exception filters → consistent JSON error shape consumed by both clients
- **Config** — `.env` files; `@nestjs/config` on backend, `next/env` on admin, `expo-constants` on mobile

## 3. Data Model & API Contract

### Schema

```
WellnessPackage
├── id              INT UQ PK AUTO_INCREMENT
├── name            VARCHAR(255) NOT NULL
├── description     TEXT
├── price           DECIMAL(10,2) NOT NULL
├── duration_minutes INT NOT NULL
├── image_url       VARCHAR(500) NULLABLE
├── category        ENUM('massage','facial','body','meditation') DEFAULT 'massage'
├── status          ENUM('draft','active','archived') DEFAULT 'draft'
├── created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
├── updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP
└── created_by      VARCHAR(255) NULLABLE
```

**Extensions beyond the base entity:** `image_url`, `category`, `status`, `updated_at`, `created_by` — all added to make the admin CRUD richer and the API contract more realistic. Category enables filtering on mobile; status lets admins soft-hide packages.

### API routes

#### Admin (`/admin/packages`)

| Method | Path | Description | Request | Response | Status codes |
|--------|------|-------------|---------|----------|-------------|
| GET | /admin/packages | List all | — | `WellnessPackage[]` | 200 |
| GET | /admin/packages/:id | Get one | — | `WellnessPackage` | 200, 404 |
| POST | /admin/packages | Create | `CreatePackageDto` | `WellnessPackage` | 201, 400 |
| PUT | /admin/packages/:id | Update | `UpdatePackageDto` | `WellnessPackage` | 200, 404, 400 |
| DELETE | /admin/packages/:id | Delete | — | `204 No Content` | 204, 404 |

#### Mobile (`/mobile/packages`)

| Method | Path | Description | Request | Response | Status codes |
|--------|------|-------------|---------|----------|-------------|
| GET | /mobile/packages | List active only | `?category=` optional | `WellnessPackage[]` | 200 |
| GET | /mobile/packages/:id | Get one | — | `WellnessPackage` | 200, 404 |

**Why admin and mobile differ:** Mobile endpoints filter by `status = 'active'` by default and expose a subset of fields (no internal audit fields). Admin endpoints show all packages regardless of status and include audit fields.

### Validation rules

- `name`: 1–255 chars, required
- `description`: max 5000 chars, optional
- `price`: > 0, decimal, required
- `duration_minutes`: > 0, integer, required
- `category`: one of the enum values, optional
- `status`: one of the enum values, optional (default: 'draft')
- `image_url`: max 500 chars, valid URL, optional

### Standard error shape

```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "price must be a positive number"],
  "error": "Bad Request"
}
```

## 4. Key Technical Decisions & Trade-offs

### 1. React Native (Expo) over Flutter
**Why:** The mobile app was originally specified as Flutter; I'm switching to Expo because it shares TypeScript types with the rest of the stack, the team is already TypeScript-heavy, and Expo's tooling (EAS, OTA updates) is mature for this kind of read-only app.
**Rejected:** Flutter — would require a separate Dart codebase and duplicate type definitions. The assessment values speed and coherence; Expo delivers both.

### 2. Monolithic NestJS backend (no microservices)
**Why:** The domain is trivial — a single entity with two API surfaces. A monolith keeps deployment simple (one service, one Docker container) and avoids network overhead. The controller/module structure already enforces separation between admin and mobile routes.
**Rejected:** Microservices, BFF layer — overkill for the current scope. Would add BFF if the mobile app needed significantly different data shapes in production.

### 3. MySQL over PostgreSQL
**Why:** Specified in the assessment requirements.
**Trade-off:** MySQL is fine for this workload (single table, no complex joins). At scale, PostgreSQL would be preferable for its JSON support and better indexing capabilities.

### 4. No auth layer in prototype
**Why:** Adding auth would consume a disproportionate amount of the 4–8 hour budget. Mobile endpoints are read-only and public-facing; admin endpoints would need protection in production.
**Would do differently:** Add JWT-based auth with a login endpoint and middleware guard on all admin routes.

### 5. React Query for data fetching on both clients
**Why:** React Query handles caching, loading states, and refetching with minimal boilerplate. Works identically in Next.js (admin) and React Native (mobile), reducing context-switching.
**Rejected:** Redux, Zustand, raw fetch — any would work but React Query's declarative approach is the best fit for a data-fetching-heavy app.

## 5. AI Workflow

### Tools used

- **OpenCode (CLI)** — primary agent for writing all code, creating files, running commands
- **GitHub Copilot** — in-editor completions while iterating on component code

### Prompts that worked well

1. **"Create a NestJS module with CRUD for WellnessPackage entity including DTOs, service, controller, TypeORM entity, and MySQL connection config"** — produced a complete, working module in one shot with proper dependency injection and validation decorators.

2. **"Generate a Next.js App Router page with a data table that lists packages from /admin/packages, with inline edit/delete buttons"** — got a well-structured page with loading states and error handling, needed only minor styling adjustments.

### Where AI got it wrong

**Prompt:** "Create a React Native Expo screen that fetches and displays packages"
**Issue:** AI generated a bare React Native component using `ScrollView` + `fetch` without Expo's recommended patterns (no `expo-router`, no loading states, no typed API client).
**Correction:** Refined the prompt to specify Expo Router, React Query, and a typed API client. After regenerating, the code matched the project conventions.

### Where I chose NOT to use AI

- **Architecture decisions** — AI tends to over-engineer (suggesting microservices, Redis caching, complex auth flows). I scoped these manually.
- **Trade-off analysis** — AI cannot evaluate team context or assessment constraints. These decisions were mine.
- **Reviewing AI output** — every generated file was read and validated manually before committing. AI writes fast but sometimes wrong.
