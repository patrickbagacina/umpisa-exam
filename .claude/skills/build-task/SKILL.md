---
name: build-task
description: Build one or more T# tasks from PLAN.md end to end, against its Contract, with unit tests and checks. Use for any task on the PLAN.md task list.
---
Read CLAUDE.md and PLAN.md. Build only the named tasks, only in the folder the prompt names.
Follow the Contract exactly. If it must change, edit PLAN.md first and say so.
Check installed package versions before using an API you are unsure about.
UI: loading, empty, error and success states; reuse src/components first.
Add unit tests for service logic and non-trivial components.
Run build, lint and tests for that app and fix failures.
Tick each task's box in PLAN.md only when its check passes. Report what works, what was skipped,
and anything the user must click to verify. Commit only if asked.