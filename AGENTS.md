# Tug — Wellness Package Management System

## What this is

Technical assessment scaffold for a Full Stack Developer role. The assessment prompt is in `assessment.md`. No application code exists yet — everything below is to be built.

## Expected repo structure

```
/backend          — NestJS + TypeScript + MySQL
/admin-portal     — Next.js + TypeScript
/mobile-app       — Flutter
/docs             — design doc (Part A of assessment)
/scripts          — utility scripts
```

## Existing code

- `scripts/pdf-extract.js` — extracts text from PDFs using `pdf-parse` v2 (`npm run` in `scripts/`). Run with `node pdf-extract.js <path>`.

## Git

- Remote: `git@hanson.github.com:raccoongeniuses/tug.git`
- Default branch: `main`
- No root `.gitignore` yet — only `scripts/.gitignore` ignores `node_modules/`
- Use conventional commits (e.g., `feat:`, `fix:`, `docs:`, `chore:`)
