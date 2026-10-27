---
name: fix
description: Find and fix the cause of a reported failure (a check step, an error or a red test) with the smallest change. Use when something in the app or tests is broken.
---
Read CLAUDE.md and the PLAN.md section the failure relates to.
Reproduce or locate the cause before editing. Fix the cause, not the symptom.
Fix code when a test caught a real bug; fix a test only if it tested the wrong thing. Never delete tests.
Re-run that app's tests and build. Report the cause, the change and the result in three lines.