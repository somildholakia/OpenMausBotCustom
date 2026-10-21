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

This first phase establishes a read-only device probe and documentation only. The full headless server has not yet been patched to skip unsupported subsystems. Do not run the production server on Android until a dedicated compatibility branch isolates browser, Electron, CUA, DuckDB and other unsupported native paths.

## 4. Later smoke-test acceptance criteria

Once the runtime path is isolated and tested on a supported development machine, test on the phone:

1. Headless server starts without Electron, Chrome, CUA, DuckDB, or Docker.
2. Local health endpoint returns success.
3. SQLite persistence and FTS5 work after restart.
4. One configured OpenAI-compatible gateway produces a streamed text response.
5. API and settings routes reject unauthenticated remote requests.
6. Server restart does not lose conversations.
7. Background behavior is tested with screen off and battery optimization settings documented.

Do not claim any criterion passed until the actual test is run.
