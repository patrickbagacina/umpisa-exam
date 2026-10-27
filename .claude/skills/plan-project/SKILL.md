---
name: plan-project
description: Start a new project from a short brief by writing PLAN.md (workflows, screens, rules, API contract, checkbox task list, checks) and CLAUDE.md (rules pointing to PLAN.md). Use at the very start of a project, before any scaffolding.
disable-model-invocation: true
---
Treat the user's message as the brief: product, users, stack, and any required items (e.g. an exam brief).
Do not ask questions unless the stack or the core feature is missing. State assumptions in PLAN.md instead.

Write PLAN.md (max 90 lines), sections in this order:
1. Purpose (one line) and Stack (one line).
2. Workflows: W# as arrow chains. Screens: S# with route; mark protected routes.
3. Rules: status values and allowed transitions, validation, seed data with a demo login.
4. Contract: the full API schema in one code block (GraphQL SDL or REST endpoints with request and
   response shapes), plus which operations need auth. Only fields the screens use.
5. Tasks: checkbox list. T1 scaffold; then API tasks (auth + seed first, one per entity, unit tests in
   each); then web tasks (shell + login first, then screens, component tests last); last task README +
   fresh-clone run. Each task names its folder and a one-line check. Aim for 6-9 tasks.
6. Checks: one M# per workflow, plus a fresh-clone run.
7. If the brief lists required items, add a table: Requirement -> where it is met.

Then write CLAUDE.md (max 15 lines). Don't repeat PLAN.md:
- "Read PLAN.md before any task. Build against its Contract; update the Contract first if it must change."
- Folder structure for the chosen stack.
- Rules: one task at a time; reuse components; unit tests for logic; run the touched app's build, lint
  and tests before reporting; tick the task's box in PLAN.md when its check passes; no real secrets.
- Commands: "Pending until T1."
- Skills available in .claude/skills/ and when to use each.

If there's no repo yet, run git init and add a .gitignore for the stack.
Commit "docs: plan and task list". Then show the task list and the Contract, and stop. Do not scaffold.
