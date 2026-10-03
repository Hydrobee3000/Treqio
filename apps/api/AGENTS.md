# apps/api - agent instructions

Rules for the backend. The root [AGENTS.md](../../AGENTS.md) applies as well.

## Database

- Run Prisma commands from `apps/api` or with `--workspace=@treqio/api`.
- After changing `prisma/schema.prisma`, and on a fresh clone, regenerate the client (`npm run db:generate`); schema changes also need a migration (`npm run db:migrate`).

## Live checks against the local database

- Start the database from the repository root: `docker compose up -d --wait db`. The database user is `postgres`.
- The local database holds the user's real data. When creating test data, record each created id at creation time and delete only those rows at the end. Restore any user setting you changed to its previous value.
