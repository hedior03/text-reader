# text-reader

A text-to-speech reader with synchronized word highlighting (Speechify alternative).

## Tech Stack

- **Framework**: TanStack Start (SSR) on Vite 8 + Nitro v3
- **UI**: React 19 + shadcn/ui + Tailwind CSS v4
- **Package Manager**: Bun
- **Linting/Formatting**: Biome
- **Auth**: Better Auth
- **Database**: PostgreSQL via Drizzle ORM

## Commands

```bash
bun run dev       # Start dev server on :3000
bun run build     # Production build
bun run check     # Lint + format + typecheck
bun run db        # Drizzle kit CLI
```

## Project Goal

Build a functional text reader quickly, then iterate on UX. Initial focus:
- Dump text → read aloud
- Synchronized word highlighting

Performance optimization comes later.
