# [**<img width="32" height="32" alt="favicon" src="https://github.com/user-attachments/assets/b01c3249-f80f-4065-9f3b-94ff36a369ca" /> Treqio**](https://treqio.online)

A personal media tracker — books, games, movies and more. Track what you've read, played or watched, rate and review them, share progress with friends via a real-time activity feed.

> # [**🚀 Open site**](https://treqio.online)
>
> <img width="1918" height="911" alt="image" src="https://github.com/user-attachments/assets/02bc74c9-abe7-4af4-b0e6-4f51b098a80c" />
> <img width="1918" height="906" alt="image" src="https://github.com/user-attachments/assets/58b232d0-dfc9-4118-a107-3f43700bfa73" />

> **Status:** In active development. Core features are being built iteratively.

---

## Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
  - [Branch naming](#branch-naming)
  - [Commit convention](#commit-convention)
  - [Merge strategy](#merge-strategy)
  - [Release process](#release-process)
- [API](#api)

---

## Tech Stack

### Frontend

| Tool                                            | Purpose                      |
| ----------------------------------------------- | ---------------------------- |
| [React 19](https://react.dev)                   | UI library                   |
| [TypeScript](https://www.typescriptlang.org)    | Type safety                  |
| [Vite](https://vitejs.dev)                      | Build tool & dev server      |
| [Material UI v9](https://mui.com)               | Component library            |
| [Redux Toolkit](https://redux-toolkit.js.org)   | State management + RTK Query |
| [React Router v7](https://reactrouter.com)      | Client-side routing          |
| [SCSS Modules](https://sass-lang.com)           | Component scoped styles      |
| [Framer Motion](https://www.framer.com/motion/) | Animations                   |
| [react-i18next](https://react.i18next.com)      | Internationalization (i18n)  |
| [React Hook Form](https://react-hook-form.com)  | Form state & validation      |
| [Zod](https://zod.dev)                          | Schema validation            |
| [Lucide React](https://lucide.dev)              | Icon set                     |

### Backend

| Tool                                                                                    | Purpose                             |
| --------------------------------------------------------------------------------------- | ----------------------------------- |
| [NestJS 11](https://nestjs.com)                                                         | Node.js framework                   |
| [TypeScript](https://www.typescriptlang.org)                                            | Type safety                         |
| [Prisma 7](https://www.prisma.io)                                                       | ORM                                 |
| [PostgreSQL 16](https://www.postgresql.org)                                             | Database                            |
| [Passport.js](https://www.passportjs.org)                                               | Authentication strategies           |
| [passport-google-oauth20](https://www.passportjs.org/packages/passport-google-oauth20/) | Google OAuth 2.0                    |
| [Swagger (OpenAPI)](https://swagger.io)                                                 | Interactive API docs at `/api/docs` |

### Infrastructure

| Tool                                                  | Purpose               |
| ----------------------------------------------------- | --------------------- |
| [Turborepo](https://turbo.build)                      | Monorepo build system |
| [Docker & Docker Compose](https://www.docker.com)     | Containerisation      |
| [GitHub Actions](https://github.com/features/actions) | CI/CD (planned)       |

### Code Quality

| Tool                                                      | Purpose                     |
| --------------------------------------------------------- | --------------------------- |
| [ESLint](https://eslint.org)                              | Linting                     |
| [Prettier](https://prettier.io)                           | Code formatting             |
| [Husky](https://typicode.github.io/husky)                 | Git hooks                   |
| [lint-staged](https://github.com/lint-staged/lint-staged) | Run linters on staged files |
| [commitlint](https://commitlint.js.org)                   | Commit message validation   |
| [Vitest](https://vitest.dev)                              | Frontend unit testing       |
| [React Testing Library](https://testing-library.com)      | Component testing           |
| [Jest](https://jestjs.io)                                 | Backend unit testing        |

---

## Prerequisites

- [Node.js](https://nodejs.org) >= 24
- [npm](https://www.npmjs.com) >= 10
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Hydrobee3000/Treqio.git
cd Treqio
```

### 2. Install dependencies

```bash
npm install
```

> This also runs `husky` automatically to set up Git hooks.

### 3. Configure environment variables

Copy the example files and fill in your values:

```bash
# Root — PostgreSQL credentials for Docker
cp .env.example .env

# API — database connection and server config
cp apps/api/.env.example apps/api/.env
```

See [Environment Variables](#environment-variables) for details.

### 4. Start the database

```bash
docker compose up db -d
```

### 5. Run database migrations

```bash
cd apps/api
npx prisma migrate dev
```

> On first run this creates all tables. Re-run whenever you change `prisma/schema.prisma`.

### 6. Start the applications

```bash
# Frontend only (http://localhost:3000)
npm run web

# Backend only (http://localhost:4000)
npm run api

# Both simultaneously
npm run dev
```

---

## Project Structure

```
treqio/
├── apps/
│   ├── web/                  # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── app/          # App-level setup: store, router, providers, theme
│   │   │   ├── pages/        # Route-level page components (+ *.test.tsx next to each)
│   │   │   ├── widgets/      # Large reusable UI blocks (layout, sidebar, mobile nav)
│   │   │   ├── features/     # User interactions (planned)
│   │   │   ├── entities/     # Business entities: Book, User (planned)
│   │   │   └── shared/       # Shared utilities, API client, typed hooks, test setup
│   │   ├── index.html
│   │   └── vite.config.ts    # Vite + Vitest config
│   │
│   └── api/                  # NestJS backend
│       ├── src/
│       │   ├── auth/         # Авторизация: стратегии, guards, контроллер, сервис
│       │   │   ├── guards/   # JwtAuthGuard
│       │   │   └── strategies/ # JwtStrategy, GoogleStrategy
│       │   ├── prisma/       # PrismaService + PrismaModule
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   ├── app.service.ts
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma # Database schema
│       │   └── migrations/   # SQL migration history
│       ├── prisma.config.ts  # Prisma 7 datasource config
│       └── Dockerfile
│
├── .husky/                   # Git hooks (pre-commit, commit-msg)
├── docker-compose.yml        # PostgreSQL + API services
├── turbo.json                # Turborepo task pipeline
└── package.json              # Root workspace config
```

> The frontend follows **Feature-Sliced Design (FSD)** architecture — layers are imported strictly top-down: `app → pages → widgets → features → entities → shared`.

---

## Environment Variables

### Root `.env`

Used by Docker Compose to configure PostgreSQL.

| Variable            | Description       | Default    |
| ------------------- | ----------------- | ---------- |
| `POSTGRES_DB`       | Database name     | `treqio`   |
| `POSTGRES_USER`     | Database user     | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |

### `apps/api/.env`

| Variable               | Description                                     | Example                                                |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| `PORT`                 | API server port                                 | `4000`                                                 |
| `DATABASE_URL`         | Prisma connection string                        | `postgresql://postgres:postgres@localhost:5432/treqio` |
| `JWT_ACCESS_SECRET`    | Secret for signing access tokens (15 min)       | random 64-byte hex string                              |
| `JWT_REFRESH_SECRET`   | Secret for signing refresh tokens (7 days)      | random 64-byte hex string                              |
| `GOOGLE_CLIENT_ID`     | Google OAuth app client ID                      | `xxx.apps.googleusercontent.com`                       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret                  | `GOCSPX-xxx`                                           |
| `GOOGLE_CALLBACK_URL`  | OAuth redirect URI (must match Google Console)  | `http://localhost:4000/api/auth/google/callback`       |
| `FRONTEND_URL`         | Frontend origin for post-auth redirect          | `http://localhost:3000`                                |
| `NODE_ENV`             | Runtime environment — set by platform or Docker | `production`                                           |
| `SWAGGER_ENABLED`      | Enable Swagger UI at `/api/docs`                | `true`                                                 |

---

## Available Scripts

Run from the **project root**:

> To run a script for a specific package only, add `--workspace=@treqio/web` (frontend) or `--workspace=@treqio/api` (backend). Example: `npm run test --workspace=@treqio/web`.

| Script                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `npm run web`           | Start frontend dev server                                       |
| `npm run api`           | Start backend dev server                                        |
| `npm run dev`           | Start all apps simultaneously                                   |
| `npm run build`         | Build all apps                                                  |
| `npm run lint`          | Lint all apps                                                   |
| `npm run lint:fix`      | Auto-fix lint errors                                            |
| `npm run typecheck`     | Type-check all apps                                             |
| `npm run format`        | Format all files with Prettier                                  |
| `npm run test`          | Run all tests across all packages                               |
| `npm run test:watch`    | Watch mode — re-runs tests on file changes (`@treqio/web` only) |
| `npm run test:coverage` | Run tests with coverage report (per workspace)                  |

Database commands live in `apps/api/` — run them with the workspace flag from the project root, or `cd` into the folder first:

```bash
# From project root (recommended)
npm run db:migrate  --workspace=@treqio/api
npm run db:studio   --workspace=@treqio/api

# Or from apps/api/
cd apps/api
npm run db:migrate
npm run db:studio
```

| Script        | Description                                    |
| ------------- | ---------------------------------------------- |
| `db:migrate`  | Create and apply a new migration               |
| `db:generate` | Regenerate Prisma Client after schema changes  |
| `db:studio`   | Open visual database browser at localhost:5555 |
| `db:reset`    | Reset database and replay all migrations       |

---

## Development Workflow

### Branch naming

```
<type>/<issue-number>-<short-description>
```

`<type>` matches the nature of the change — `feature`, `fix`, `docs`, `refactor`, etc. (same vocabulary as [Commit convention](#commit-convention)). Whenever work is tied to a filed issue, its number is always included.

Examples:

```
feature/16-app-layout
fix/42-auth-token-refresh
docs/220-release-process
```

### Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <description>
```

**Types:** `feat` `fix` `refactor` `chore` `docs` `style` `test` `ci` `build` `perf` `revert`

**Scopes:** `web` `api` `docker` `deps` `auth` `books` `games` etc.

Examples:

```
feat(web): add book card component
fix(api): token refresh race condition
chore(deps): update MUI to v9
```

> Commit messages are validated automatically by commitlint on every `git commit`.

### Merge strategy

| Merge            | Strategy     | Reason                    |
| ---------------- | ------------ | ------------------------- |
| `feature → main` | Squash merge | One commit per feature    |
| `fix → main`     | Squash merge | Keeps main history linear |

Branches are deleted after merge (GitHub is configured with `delete_branch_on_merge`).

---

### Release process

The whole monorepo shares a **single product version**, stored in the root `package.json` — the single source of truth, kept in sync with the git tag. The `version` fields inside `apps/web/package.json` and `apps/api/package.json` are not used and stay untouched.

Versions are bumped **manually** at release time and pushed **directly to `main`** (no PR). Direct pushes are allowed — the `main-protection` ruleset only blocks branch deletion and force-pushes.

Pick the bump from the type of change:

| Change                  | Bump    | Command             | Example       |
| ----------------------- | ------- | ------------------- | ------------- |
| Fix                     | `patch` | `npm version patch` | 0.1.5 → 0.1.6 |
| New feature             | `minor` | `npm version minor` | 0.1.5 → 0.2.0 |
| Breaking / major rework | `major` | `npm version major` | 0.1.5 → 1.0.0 |

Steps (from the project root, on `main`):

```bash
npm version 0.1.6 --no-git-tag-version   # bump the root package.json only
git commit -am "chore: release v0.1.6"    # the version bump lives in this commit
git push origin main
git tag -a v0.1.6 -m "v0.1.6"             # the tag sits on the release commit
git push origin v0.1.6
gh release create v0.1.6 --title "v0.1.6" --notes "..."
```

> The tag points at the release commit itself, so the version bump and the tag are the same commit.

---

## API

Base URL: `http://localhost:4000/api`

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |

> Full API documentation will be available via Swagger at `/api/docs` (coming soon).
