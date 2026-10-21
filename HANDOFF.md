# HANDOFF — OpenMausBot hybrid Android prototype

## Objective

Adapt the forked OpenMausBot project toward a hybrid personal assistant: Samsung Galaxy A15 (8 GB RAM) for lightweight edge work; a suitable free cloud service for remote ingress and durable scheduled jobs; remote access from anywhere; FreeLLMAPI and OmniRoute only after exact endpoints and capabilities are verified.

## Repository pins

- Fork: https://github.com/somildholakia/OpenMausBotCustom
- Upstream: https://github.com/milind-soni/OpenMausBot
- Initial audited commit: c192de3c2d4183f721a1c544f7fcd16ae719b899
- Working branch: feat/headless-termux-probe
- Default branch was not modified by this work.

## Completed in this phase

- Created branch feat/headless-termux-probe.
- Added a read-only preflight script to report Android/Termux, Node, architecture, SQLite FTS5, filesystem and optional native dependency status.
- Added experimental Termux documentation with safety restrictions and future smoke-test acceptance criteria.
- Added the `termux:preflight` package script.
- Added a GitHub Actions workflow to validate the manifest and preflight script on Node.js 24; its run status must be checked separately.
- No runtime server code has been changed.
- No device test, build, or CI test has been run from this chat session.

## Files changed

- scripts/termux-preflight.mjs — diagnostic only; no install or source mutations.
- docs/termux.md — experimental setup and test criteria.
- HANDOFF.md — this handoff record.

## Security

- Do not commit provider keys, credentials, pairing codes, tunnel credentials, or local assistant data.
- Never expose the raw headless server port publicly.
- Keep tools disabled until authentication and approval flows are verified.
- Treat remote agent execution as privileged access.

## Known blockers

1. Upstream is designed primarily for desktop OSes; Termux compatibility is unverified.
2. Electron, desktop CUA and packaged browser dependencies are not expected to work as-is on Android.
3. DuckDB and other native dependencies need Android/ARM64 verification or feature gating.
4. Node.js >=24 and SQLite FTS5 must be confirmed on the actual device.
5. FreeLLMAPI and OmniRoute exact repositories/releases, API limits, tool-call behavior, streaming and privacy have not been validated with OpenMausBot.
6. Free cloud services may sleep or cap background execution; the phone cannot guarantee 24/7 schedules.

## Next task

1. Review the three files on this branch.
2. Install/verify a Node.js >=24 runtime in Termux if available.
3. Run node scripts/termux-preflight.mjs on the Samsung A15 and capture the full JSON report.
4. On a supported development machine or CI, trace imports in server/index.ts, server/data/deps.ts, and browser startup. Design a narrowly scoped headless profile that avoids unsupported subsystems.
5. Only then change runtime code, beginning with tests for feature gating and startup isolation.

## Verification log

- Repository metadata and source files inspected via connected GitHub access.
- Branch creation confirmed.
- Local preflight script syntax check: passed on the available Node.js 22.16.0 host.
- Local preflight execution: correctly returned BLOCKED because this environment is Node 22 (upstream requires Node >=24); SQLite FTS5 and temporary filesystem checks passed on this Linux x64 host. This is not a Termux/device test.
- Full project build/tests: not run. GitHub Actions workflow was added; no workflow run/status is visible yet, so CI success is unverified.
- Samsung A15 Termux test: not run.
- Deployment: none.
