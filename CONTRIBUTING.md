# Contributing

Dev Desk is a learning-first Electron project. Contributions should keep the code easy to read and easy to modify.

## Local Setup

```bash
npm install
npm run dev
```

If native modules fail after changing Electron or Node versions:

```bash
npm run rebuild:native
```

## Before Pull Requests

```bash
npm run lint
npm run typecheck
npm run build
```

## Code Style

- Keep features small and practical.
- Prefer existing project patterns.
- Keep renderer logic clear and direct.
- Use preload and IPC for Electron/native access.
- Keep local database changes explicit.

## Good First Features

- Text diff tool
- Color format converter
- QR code generator
- History import/export
- Favorite history records
