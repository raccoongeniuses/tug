# Runbook

For project overview, structure, and design see [README.md](./README.md). For design decisions see [docs/plan.md](./docs/plan.md).

## Quick start — Docker

The fastest way to bring up db + backend + admin in one shot:

```bash
docker compose up --build
```

| Surface | URL |
|---------|-----|
| Admin Portal | http://localhost:3000 |
| Backend API (health) | http://localhost:4000/ |
| Swagger UI | http://localhost:4000/api/docs |
| MySQL | localhost:3306 |

The mobile app runs **outside Docker** via Expo — see [Mobile App](#mobile-app) below.

```bash
docker compose down        # stop everything
docker compose down -v     # stop + delete DB volume (full reset)
```

## Database — MySQL

### Option A: standalone Docker

```bash
docker run -d \
  --name tug-mysql \
  -e MYSQL_DATABASE=tug \
  -e MYSQL_USER=tug \
  -e MYSQL_PASSWORD=tug \
  -e MYSQL_ROOT_PASSWORD=rootpw \
  -p 3306:3306 \
  mysql:lts \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

The table is auto-created by TypeORM (`synchronize: true`) on first backend start — no manual DDL needed.

Stop/remove:

```bash
docker stop tug-mysql && docker rm tug-mysql
```

### Option B: local MySQL install

Create the database and grant access to the `tug` user (or use the DDL from [docs/database.md](./docs/database.md)):

```sql
CREATE DATABASE IF NOT EXISTS tug
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Connection params: host `localhost`, port `3306`, user `tug`, database `tug`. Set a password for the `tug` user and put it in `DB_PASSWORD` in the backend `.env`.

> The full `CREATE TABLE` DDL is in [docs/database.md](./docs/database.md). With TypeORM `synchronize: true` in dev, the table is auto-created — the manual DDL is only needed if `synchronize` is off or for production.

## Backend — NestJS

Prerequisites: Node 20+, npm, running MySQL ([section above](#database--mysql)).

```bash
cd backend
cp .env.example .env        # fill in DB_PASSWORD and adjust CORS_ORIGINS if needed
npm install
npm run start:dev           # → http://localhost:4000
```

**Required env vars** (from `.env.example`):

```env
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tug
DB_PASSWORD=                # set your MySQL tug user password
DB_NAME=tug
CORS_ORIGINS=http://localhost:3000
```

- Health: http://localhost:4000/
- Swagger: http://localhost:4000/api/docs
- TypeORM `synchronize: true` auto-creates the `wellness_packages` table on first start.

Other scripts:

```bash
npm run build               # production build
npm start                   # production start
npm test                    # Jest unit tests
npm run lint                # ESLint
```

## Admin Portal — Next.js

Prerequisites: Node 20+, npm, backend running on `:4000`.

```bash
cd admin-portal
cp .env.local.example .env.local
npm install
npm run dev                 # → http://localhost:3000
```

**Required env var** (from `.env.local.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Other scripts:

```bash
npm run build               # production build
npm start                   # production start
npm run lint                # Next.js lint
```

## Mobile App — Expo

Prerequisites: Node 20+, npm, Expo Go on your phone, backend running and reachable from the device.

```bash
cd mobile-app
cp .env.example .env        # use your LAN IP, not localhost (see below)
npm install
npm start                   # or: npx expo start
```

**Required env var** (from `.env.example`):

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

> **On a physical device**, change `localhost` to your machine's LAN IP (e.g. `http://192.168.1.42:4000`). On an Android emulator, `10.0.2.2` maps to the host loopback. On iOS simulator, `localhost` works.

The mobile app is read-only — it fetches active packages from `/mobile/packages`. All mutations happen through the admin portal.

Other scripts:

```bash
npm run android             # expo start --android
npm run ios                 # expo start --ios
npm run web                 # expo start --web
npm run typecheck           # tsc --noEmit
```

## Full local stack (no Docker)

1. Start MySQL ([section above](#database--mysql))
2. **Terminal 1** — backend:
   ```bash
   cd backend && npm run start:dev
   ```
   → http://localhost:4000

3. **Terminal 2** — admin portal:
   ```bash
   cd admin-portal && npm run dev
   ```
   → http://localhost:3000

4. **Terminal 3** — mobile app:
   ```bash
   cd mobile-app && npm start
   ```
   → scan QR code with Expo Go

## Ports reference

| Service | Port | Notes |
|---------|------|-------|
| MySQL | 3306 | |
| Backend API | 4000 | NestJS |
| Admin Portal | 3000 | Next.js dev server |
| Expo / Metro | 8081 | Default Metro bundler port |

## Troubleshooting

**Backend can't connect to MySQL**
Check that MySQL is running (`docker ps` or `mysqladmin ping`), verify `.env` DB credentials match, and confirm port 3306 is open.

**Admin shows fetch errors**
The backend must be running on `:4000`. Verify `NEXT_PUBLIC_API_URL=http://localhost:4000` in `admin-portal/.env.local` and that `CORS_ORIGINS` in the backend `.env` includes `http://localhost:3000`.

**Mobile can't fetch packages**
Use your machine's LAN IP (not `localhost`) for `EXPO_PUBLIC_API_URL` — e.g. `http://192.168.x.x:4000`. For dev, set `CORS_ORIGINS=` (empty) in the backend `.env` to allow all origins, or add the Expo origin explicitly.

**Port already in use**
Kill the process holding the port (`lsof -i :PORT`) or change the `PORT` env var in `.env`.

**Docker: DB schema changes not picked up**
Run `docker compose down -v` to delete the MySQL volume, then `docker compose up --build` to recreate from scratch.
