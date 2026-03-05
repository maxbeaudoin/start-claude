# TanStack Start + Bun

A full-stack React starter using [TanStack Start](https://tanstack.com/start) with [Bun](https://bun.sh).

## Prerequisites
- Node.js (v20+)
- Bun
- GitHub CLI (gh)
- jq (used by Claude Code hooks)

## Stack

- [TanStack Start](https://tanstack.com/start) — file-based routing, SSR, server functions
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- [TanStack Query](https://tanstack.com/query), [Form](https://tanstack.com/form), [Table](https://tanstack.com/table)
- [Biome](https://biomejs.dev) — linting & formatting
- [Vitest](https://vitest.dev) — testing

## Development

```bash
bun install
bun run dev
```

## Production

```bash
bun run build
bun run start
```

## Deploy on Railway
The easiest way to deploy this app is to use [Railway](https://railway.app/new).