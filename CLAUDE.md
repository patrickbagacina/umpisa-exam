# CLAUDE.md
Read PLAN.md before any task. Build against its Contract; update the Contract first if it must change.

**Structure:** `docker-compose.yml` + root `package.json` (npm workspaces) · `api/` NestJS: `src/{auth,users,items,database/{migrations,seed}}`, feature modules with `*.entity.ts`, `*.resolver.ts`, `*.service.ts`, `dto/`, `*.spec.ts` beside the code · `web/` Vite React: `src/{app,auth,components,pages,graphql}`, `*.test.tsx` beside the component.

**Rules:**
- One task at a time; build only the T# you were given. Reuse components (`web/src/components`) and shared GraphQL documents (`web/src/graphql`) before adding new ones.
- Unit tests for logic (services, status transitions, validation, form behaviour).
- Run the touched app's build, lint and tests before reporting; report failures with output.
- Tick the task's box in PLAN.md when its check passes.
- No real secrets: `.env.example` and config defaults only, dev-only JWT secret.

**Commands:** Pending until T1.

**Skills (`.claude/skills/`):** `plan-project` — start a project from a brief (already run) · `build-task` — build a T# from PLAN.md · `fix` — find and fix the cause of a failing check, error or test.
