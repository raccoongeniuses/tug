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

| Tool | Used for | Why it helped |
|------|----------|---------------|
| **OpenCode (CLI)** | Primary agent — scaffolding projects, generating modules/controllers/DTOs/components, writing config files, running linters/tests, creating Dockerfiles and docker-compose | Terminal-native, no context-switching, can delegate work to specialized subagents (light/worker/heavy) |
| **GitHub Copilot** | In-editor completions while iterating on component code (CSS, prop forwarding, repetitive patterns) | Fast, in-flow suggestions that don't break concentration |
| **Tavily MCP** | Web research — design inspiration for admin dashboards and wellness mobile UIs in 2026 | Integrated directly into OpenCode, so the agent could search the web and incorporate findings into UI redesigns |

### Prompts that worked well

1. **"Create a NestJS module with CRUD for WellnessPackage entity including DTOs, service, controller, TypeORM entity, and MySQL connection config."**
   Why it worked: Specific about the framework, pattern (CRUD), architecture (module with DTOs/service/controller), and database. The agent produced a complete working module in one shot — DTOs with class-validator, service with repository pattern, controller with proper HTTP semantics, and entity with correct decorators.

2. **"Redesign the admin portal with a wellness/holistic theme. Use a teal primary color palette, Inter font, CSS custom properties. Build a sticky navbar with logo, card-based grid with status badges, shimmer loading skeletons, filter pills..."**
   Why it worked: Concrete visual constraints (teal palette, Inter font, CSS variables) and specific UI elements (badges, cards, skeletons). The long but unambiguous prompt produced a coherent design system rather than ad-hoc inline styles.

3. **"Create a `docker-compose.yml` with three services: MySQL `mysql:lts` (tug db, tug user, utf8mb4), NestJS backend (builds from `./backend`, waits for MySQL healthy, port 4000), and Next.js admin portal (builds from `./admin-portal`, port 3000)."**
   Why it worked: Exact image name, dependency ordering (`depends_on` with health check), and each service's build context were specified. The agent wrote a correct compose file with proper volume mounts, environment variables, and network configuration on the first try.

### Where AI got it wrong (and how I caught it)

**Example 1: React Native convention mismatch**
- **Prompt:** "Create a React Native Expo screen that fetches and displays packages"
- **Issue:** AI generated a bare `ScrollView` + `useEffect` + `fetch` — no `expo-router`, no React Query, no typed API client. Functional but ignored all project conventions.
- **How I caught it:** Manually reviewing the file, I noticed it bypassed the existing `src/api/client.ts` and `src/types/index.ts` modules. The component had no loading/error states.
- **Correction:** Refined the prompt: "Use expo-router for the screen, React Query for data fetching, a typed API client from `src/api/client.ts`, and shared types from `src/types/index.ts`." The regenerated output was idiomatic.
- **Lesson:** AI defaults to the simplest implementation. You must cite specific project files, conventions, and libraries in prompts if you want them followed.

**Example 2: Docker production build config mismatch**
- **Prompt:** "Create a Dockerfile for the Next.js admin portal"
- **Issue:** AI generated `COPY .next/` instead of `COPY .next/standalone/`, missing that `next.config.ts` had `output: 'standalone'`. Container would fail at runtime.
- **How I caught it:** Mentally tracing the Dockerfile build steps — if `next build` writes to `.next/standalone/server.js`, the COPY should point there.
- **Correction:** Prompted the agent to fix both the COPY path and WORKDIR to target the standalone output directory.
- **Lesson:** AI assumes default build behavior. When you use non-default config, you must verify the AI understood downstream effects.

### Where I chose NOT to use AI

- **Architecture & scoping** — AI tends to over-engineer (suggesting microservices, Redis caching, complex auth). I scoped to a monolith with no auth because the domain is trivial and the 4–8 hour budget is tight.
- **Trade-off analysis** — AI cannot evaluate assessment constraints or team context. Decisions like Expo over Flutter, monolith over microservices, no auth in prototype were mine.
- **Code review of every AI-generated file** — I read every file before committing. Caught bugs (missing NotFoundException guard in delete, standalone output mismatch, wrong Expo SDK version) that the agent wouldn't self-detect.
- **Commit strategy** — Deliberately committed after each meaningful unit of work with conventional commit messages, keeping history clean and reviewable. AI shouldn't auto-commit.
