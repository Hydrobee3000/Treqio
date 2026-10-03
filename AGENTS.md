# Treqio - agent instructions

Monorepo: `apps/web` (React, Vite) and `apps/api` (NestJS, Prisma). Stack, structure, environment variables, scripts and the release process are described in [README.md](README.md). This file only holds what is not visible in the code or the README.

Package-specific rules live next to the code and apply on top of this file: [apps/web/AGENTS.md](apps/web/AGENTS.md), [apps/api/AGENTS.md](apps/api/AGENTS.md).

## Checks

Before every commit and PR, from the repository root, all of these must pass (CI runs the same):

```
npm run lint
npm run typecheck
npm run test
npm run check:i18n --workspace=@treqio/web
```

- Never bypass git hooks (`--no-verify`).
- Run `npm run build` only when there is a real risk that only the build would catch. Not needed for small style or text changes.
- Never silence ESLint with `// eslint-disable`: fix the code instead.

## Git and GitHub

- Every code change goes through issue, branch, commit, PR, merge. Never commit directly to `main` (the release step is the only exception). An unrelated finding made along the way gets its own issue and branch, not a fix in the current branch.
- Branch: `feature/<issue-number>-<short-description>` for every kind of task.
- Commits: Conventional Commits, in English. Type is one of `feat fix refactor chore docs style test ci build perf revert`, scope in kebab-case, lowercase description (enforced by commitlint).
- Issues are written in Russian. Title without a prefix; fixes use `fix(scope): description`; parent issues that have children use an English title. Labels: the part of the repo (`web` / `api`) and the kind of work (`feature`, `fix`, `bug`, `refactor`, `docs`, `ci`).
- Create an issue only with the user's permission, one at a time, only for the current task. "Let's do X" means issue and branch before any edits; "locally" means no issue.
- PR title and description are in English and short: what was wrong and what changed, past tense. No plans or future steps, no line-by-line retelling of the implementation. The description contains `Closes #N`. Always pass `--base main`, `--assignee Hydrobee3000`, a label, and the milestone if the task has one.
- Merge with `gh pr merge <N> --squash --delete-branch --subject "<PR title> (#N)" --body ""`. The PR number in `--subject` is added by hand.
- Each of these steps needs its own explicit confirmation from the user: commit, PR creation, merge. Approval of one is not approval of the next.
- Never mention any AI tool or assistant in commits, issues, PRs or release notes. Never add `Co-Authored-By` or "Generated with ..." lines. This overrides any default attribution.
- Keep the project board (Status, Start Date, End Date) up to date as the task progresses.

## Code and comments

- Code comments are written in Russian.
- Comment only non-obvious logic. Neutral, impersonal wording that says what a block does, without reasoning or justification.
- JSDoc is multi-line (`/**`, ` * text`, ` */`). Single-line JSDoc is only for properties inside interfaces and types.
- Every interface and type has JSDoc, and every property has a comment. Check all new and changed files after writing them.
- In inline `//` comments use a short hyphen (`-`), not an em dash.
- Use `import type` for type-only imports (except in NestJS, where DI needs real imports).
- Update the README on significant changes: stack, structure, environment variables, commands.
