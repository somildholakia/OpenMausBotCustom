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
- Added experimental Termux documentation, safety restrictions, and gateway notes for FreeLLMAPI/OmniRoute (documented endpoints only; not tested against live providers).
- Added the `termux:preflight` package script.
- Added a GitHub Actions workflow to install the locked dependencies, run TypeScript checks, run server/config.test.ts and server/data/engine-termux.test.ts, validate the preflight script, and execute it on Node.js 24.
- Added an opt-in OMB_TERMUX_HEADLESS=1 override to the existing built-in-browser feature gate in server/config.ts.
- Added a data-engine gate in server/data/engine.ts so it returns a clear unavailable reason before attempting native DuckDB loading when the flag is enabled.
- Added focused tests in server/config.test.ts and server/data/engine-termux.test.ts.
- This flag disables two optional feature paths only; it does not establish full Android compatibility.
- The focused Node.js 24 CI run passed the manifest check, syntax check, 205 config tests and the preflight. A new data-engine test initially failed because the assertion expected the error code at the wrong level; the assertion was corrected, and a rerun passed the focused workflow. A new workflow run including full typecheck is required after the latest workflow edit.
- No device test or full server startup test has been run.

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
3. DuckDB is now gated off under OMB_TERMUX_HEADLESS=1, but other native dependencies still need Android/ARM64 verification or feature gating.
3a. FreeLLMAPI has Sharp and optional better-sqlite3; OmniRoute has Playwright and Sharp. Do not assume either gateway can run on the phone; prefer a compatible Linux cloud worker until tested.
4. Node.js >=24 and SQLite FTS5 must be confirmed on the actual device.
5. FreeLLMAPI and OmniRoute exact repositories/releases, API limits, tool-call behavior, streaming and privacy have not been validated with OpenMausBot.
6. Free cloud services may sleep or cap background execution; the phone cannot guarantee 24/7 schedules.

## Next task

1. Confirm the latest Node.js 24 CI run including typecheck is green.
2. Install/verify a Node.js >=24 runtime in Termux if available.
3. Run node scripts/termux-preflight.mjs on the Samsung A15 and capture the full JSON report.
4. The CI workflow runs the focused config and data-engine gate tests plus full typecheck on Node.js 24+; run lint separately if the full CI does not cover it.
5. Trace imports in server/index.ts, server/data/deps.ts, and browser startup. Design a narrowly scoped headless profile that avoids unsupported subsystems.
6. Test dependency installation and startup on a supported ARM64/Termux environment before adding more platform gates.

## Verification log

- Repository metadata and source files inspected via connected GitHub access.
- Branch creation confirmed.
- Local preflight script syntax check: passed on the available Node.js 22.16.0 host.
- Local preflight execution: correctly returned BLOCKED because this environment is Node 22 (upstream requires Node >=24); SQLite FTS5 and temporary filesystem checks passed on this Linux x64 host. This is not a Termux/device test.
- Full project build/tests: not run locally. Focused CI passed after the DataFailure assertion fix; the latest workflow update adds full typecheck and needs a fresh run.
- Samsung A15 Termux test: not run.
- Deployment: none.
