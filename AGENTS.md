# Tug — Wellness Package Management System

## What this is

Technical assessment scaffold for a Full Stack Developer role. The assessment prompt is in `docs/assessment.md`. No application code exists yet — everything below is to be built.

## Expected repo structure

```
/backend          — NestJS + TypeScript + MySQL
/admin-portal     — Next.js + TypeScript
/mobile-app       — React Native + Expo + TypeScript
/docs             — design doc (Part A of assessment)
/scripts          — utility scripts
```

## Existing code

- `scripts/pdf-extract.js` — extracts text from PDFs using `pdf-parse` v2 (`npm run` in `scripts/`). Run with `node pdf-extract.js <path>`.
- `docs/plan.md` — design document (Part A of assessment)
- `docs/database.md` — database schema design and DDL
- `docs/progress.md` — implementation tracker; edit this as work lands

## Config

- `opencode.example.json` — template for local OpenCode config with MCP servers. Copy to `opencode.json` and fill in your keys.

## Git

- Remote: `git@hanson.github.com:raccoongeniuses/tug.git`
- Default branch: `main`
- No root `.gitignore` yet — only `scripts/.gitignore` ignores `node_modules/`
- Use conventional commits (e.g., `feat:`, `fix:`, `docs:`, `chore:`)
- After completing a meaningful unit of work (a working module, a screen, a config change), commit it immediately — don't batch unrelated changes into one commit
