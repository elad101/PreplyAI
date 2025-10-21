# AGENTS.md

A predictable guide for coding agents working on this repository. Keep this file concise, actionable, and always up-to-date.

## Project overview

- Monorepo layout:
  - `apps/api/`: Node.js + Express + TypeScript + Firebase Admin + Google APIs
  - `apps/web/`: React + TypeScript (Vite) + Firebase Auth
  - `apps/worker/`: Background worker for AI briefing generation
  - `new UI/`: Prototype UI components library

## Setup commands

- Install deps (root is a simple workspace; install per package):
  - API: `cd apps/api && npm install`
  - Web: `cd apps/web && npm install`
  - Worker: `cd apps/worker && npm install`

- Environment
  - Use `.env` files for local only. Never commit secrets. In CI/Prod use GitHub Secrets.
  - Required API envs are validated in `apps/api/src/config/environment.ts`.

## Local development

- Start backend API: `cd apps/api && npm run dev`
- Start frontend: `cd apps/web && npm run dev`
- Start worker: `cd apps/worker && npm run dev`

## Database

- Uses **Firebase Firestore** for data storage
- No migrations needed - schema-less NoSQL database
- Data models defined in TypeScript types in `apps/api/src/types/`
- Collections: users, meetings, briefings, settings
- Never run destructive commands on staging/production

## Tests

- Run API tests: `cd apps/api && npm test`
- Run Web tests: `cd apps/web && npm test`
- Run Worker tests: `cd apps/worker && npm test`
- Type-check: `npm run type-check` in respective app directory
- Lint: `npm run lint` in respective app directory
- Tests use Firebase Emulator Suite for local testing

## Code style

- Language: TypeScript with strict typings where feasible
- Naming: descriptive; no 1–2 character names
- Control flow: prefer early returns; handle errors explicitly
- Comments: explain "why", not "how"; avoid inline commentary
- Formatting: match existing style; avoid unrelated reformatting

## Security rules

- Do not hardcode secrets or passwords; use environment variables and GitHub Secrets in CI/CD.
- Staging and production must use separate database instances.
- Centralize API base URLs via environment configuration; avoid duplicating endpoint base strings.
- CORS/Socket.IO origins must be allowlisted from environment; no wildcard with credentials in non-dev.
- In production, require Firebase token verification; any dev auth bypass must be gated on `NODE_ENV=development`.
- Health/diagnostic endpoints should be minimal and protected in non-dev.

## Performance rules

- Use Redis caching where appropriate via `apps/api/src/utils/cache.ts`.
- Batch Firestore reads/writes to minimize round trips.
- Add pagination for list endpoints using Firestore cursors.
- Cache AI-generated content to reduce OpenAI API calls.

## CI/CD

- **Platform**: GCP Cloud Run with Workload Identity Federation (no static keys)
- **Workflows**: Separate pipelines for API (`.github/workflows/deploy-api.yml`) and Web (`.github/workflows/deploy-web.yml`)
- **Triggers**: 
  - Push to `main` → production deployment
  - Push to `develop` → staging deployment
  - Tags (`v*`) → production with version tag
  - Manual via `workflow_dispatch`
- **Pipeline stages**:
  1. Authenticate to GCP via Workload Identity Federation
  2. Build multi-stage Docker image (node:20-alpine for API, nginx:alpine for Web)
  3. Push to Artifact Registry (`salesprep` repository)
  4. Deploy to Cloud Run with environment-specific configuration
  5. Health check verification
- **Docker**:
  - API: `apps/api/Dockerfile` - Exposes port 8080, runs as non-root user
  - Web: `apps/web/Dockerfile` - Nginx serving static files, port 8080
- **Secrets**: All environment variables injected from GitHub Secrets (see `DEPLOYMENT.md`)
- **Environments**: `staging` and `production` configured in GitHub with protection rules
- **Service naming**: `salesprep-api`, `salesprep-web` (with `-staging` suffix for staging)
- **Documentation**: Complete GCP setup and deployment guide in `DEPLOYMENT.md`

## Pull requests

- Title format: `[api] …`, `[web] …`, `[worker] …`, or `[repo] …` for cross-cutting changes
- Always run: `npm run lint` and `npm run test` in respective app directory before committing.
- Add/adjust tests for code you change.

## Data rules

- **NO MOCK DATA**: Never use mock data, sample data, or hardcoded fake data at any point.
- Always fetch real data from the database via proper API endpoints.
- If data is missing, handle empty states gracefully rather than using mock data.
- Report missing data requirements instead of creating mock implementations.

## Agent-specific tips

- Prefer editing existing files over creating new ones when extending features.
- Before editing, search the codebase for existing utilities to avoid duplication.
- Share types between apps via `apps/api/src/types/` and `apps/web/src/types/`.
- Use BullMQ for background jobs - queue definitions in `apps/api/src/services/queue.ts`.

## Reference

- Standard and examples for AGENTS.md: `https://agents.md/`


