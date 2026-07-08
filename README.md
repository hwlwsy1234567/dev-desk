# Dev Desk

A local-first developer toolbox built with Electron, Vue 3, TypeScript, SQLite and Drizzle.

Dev Desk is designed as a practical learning project for modern Electron desktop apps. It keeps the app small enough to understand, while still covering the main pieces used in real desktop development: main process, preload, contextBridge, IPC, local database, logging, packaging and release builds.

## Features

- JSON formatting, compacting and validation
- Timestamp conversion
- Base64 and URL encode/decode
- UUID generation
- SHA hash digest
- JWT header and payload parsing
- Regex matching tester
- SQLite-backed tool history
- Electron secure preload IPC pattern
- Windows packaging with electron-builder

## Tech Stack

- Electron 34
- electron-vite
- Vue 3
- TypeScript
- Element Plus
- SQLite
- better-sqlite3
- Drizzle ORM
- electron-builder
- electron-log

## Project Structure

```text
assets/                 App icons and static build assets
common/                 Shared constants such as IPC channels
electron/main/          Electron main process
electron/preload/       Preload bridge exposed to renderer
electron/main/db/       SQLite schema, services and IPC controllers
migrations/             Drizzle migration files
src/                    Vue renderer app
src/api/                Renderer-side API wrappers
src/layout/             App shell layout
src/view/               App pages and tools
```

## Development

```bash
npm install
npm run dev
```

If native modules fail after changing Electron or Node versions, rebuild better-sqlite3 for Electron:

```bash
npx electron-rebuild -f -w better-sqlite3
```

## Build

```bash
npm run build
```

The Windows installer is generated under:

```text
release/<version>/
```

## Learning Goals

This repo is intentionally built as a learning project. Good next steps:

- Add more local tools such as text diff, color picker and QR code generator
- Add GitHub Actions release workflow
- Add Electron E2E tests
- Add import/export for history
- Add auto-update configuration for GitHub Releases

## License

MIT
