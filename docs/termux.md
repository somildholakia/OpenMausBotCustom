# Experimental Termux / Android support

## Scope

This guide targets a minimal headless prototype on a Samsung Galaxy A15 (8 GB RAM). It does not promise that the Electron desktop app, bundled Chromium, CUA, DuckDB, or all native modules run on Android. The upstream project targets desktop operating systems; this work is experimental.

## Safety rules

- Start on localhost only. Do not port-forward the server or publish its port.
- Never commit API keys, session credentials, pairing codes, or local assistant data.
- Keep agent tools and computer-use capabilities disabled until basic chat and authentication are verified.
- Android may stop background processes during Doze or memory pressure. Do not rely on the phone as the sole scheduler for important jobs.
- Keep the upstream license and third-party notices intact.

## 1. Install Termux

Install Termux from a trusted official distribution source. In Termux, update packages and install basic tools:

    pkg update
    pkg upgrade
    pkg install git curl nodejs-lts

The upstream repository currently requires Node.js 24 or newer. Confirm the actual version available on your device:

    node --version
    node -p 'process.platform + " " + process.arch'

Do not continue if Node.js is below the repository requirement. Do not assume a desktop Node binary or native package is interchangeable with an Android/Termux build.

## 2. Clone the project and run the read-only preflight

    git clone https://github.com/somildholakia/OpenMausBotCustom.git
    cd OpenMausBotCustom
    git checkout feat/headless-termux-probe
    node scripts/termux-preflight.mjs

The preflight reports Node version, architecture, SQLite FTS5 support, temporary filesystem writes, selected optional dependencies, and available commands. It does not install anything, edit files, or print secret values.

A preflight pass does not prove the full server works on Android.

## 3. Current implementation status

The experimental environment flag OMB_TERMUX_HEADLESS=1 forces the existing built-in-browser feature gate off and makes the data engine report a clear unavailable reason before attempting to load native DuckDB. This prevents the normal browser-start call and data-engine entry point from loading those features when their code paths are reached. It is only a pair of feature gates: it does not make Electron, CUA, other native modules, browser imports, or the full server Android-compatible. Do not run the production server on Android until startup isolation and dependency installation have been validated.

## 4. LLM gateway candidates (not yet device-tested)

OpenMausBot already has an `openai-compat` driver. Add gateways only after the headless server is stable, and test one at a time before enabling tool calls.

- **FreeLLMAPI:** upstream is https://github.com/tashfeenahmed/freellmapi. Its documented local default is `http://127.0.0.1:3001/v1`; it documents `GET /v1/models`, `POST /v1/chat/completions`, SSE streaming, and OpenAI-style tool calling. The model `auto` is a router target, not a locally hosted model. Verify the actual version and configured provider pool before relying on it.
- **OmniRoute:** upstream is https://github.com/diegosouzapw/OmniRoute. Its documented local default is `http://127.0.0.1:20128/v1`; it documents `GET /v1/models` and OpenAI-compatible chat completions with streaming. Use an exact model ID returned by that instance's model list.

Important:

1. These are candidate endpoints, not hosted services included with OpenMausBot. You must run or deploy the gateway separately and configure its upstream provider access.
2. Do not install either gateway on the A15 as the first attempt. The FreeLLMAPI server package includes Sharp and optional better-sqlite3; OmniRoute includes Playwright and Sharp plus browser/native build machinery. Android/Termux support for these dependencies is unverified. Prefer a compatible Linux cloud worker for the gateways, then test the OpenMausBot edge server separately.
3. `127.0.0.1` only works when the gateway and OpenMausBot run in the same network namespace/device. If the gateway runs on a cloud worker, use its authenticated private HTTPS endpoint instead.
3. Keep the gateway's API key out of Git and out of screenshots/logs. OpenMausBot documents that per-instance `environment` values in config.json are plaintext; prefer a supported write-only settings flow where available, or protect the server account and file permissions.
4. Begin with `tools: false`. Verify `/models`, non-streaming chat, SSE streaming, errors/rate limits and privacy before testing tool calls. A compatible JSON shape alone does not prove every upstream model supports tools.
5. Do not assume OpenMausBot automatically fails over between two configured instances. For the first version, use one tested gateway; rely on a gateway's own documented routing/fallback or implement and test cross-gateway fallback separately.

## 5. Later smoke-test acceptance criteria

Once the runtime path is isolated and tested on a supported development machine, test on the phone:

1. Headless server starts without Electron, Chrome, CUA, DuckDB, or Docker.
2. Local health endpoint returns success.
3. SQLite persistence and FTS5 work after restart.
4. One configured OpenAI-compatible gateway produces a streamed text response.
5. API and settings routes reject unauthenticated remote requests.
6. Server restart does not lose conversations.
7. Background behavior is tested with screen off and battery optimization settings documented.

Do not claim any criterion passed until the actual test is run.
