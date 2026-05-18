---
name: tanstack-start
description: Use when working with TanStack Start projects. Covers correct architecture, entry points, routing conventions, and common pitfalls to avoid re-discovery loops.
---

# TanStack Start

TanStack Start v1+ uses a **Vite plugin** — NOT vinxi. This is the most common pitfall when working with this stack.

## Architecture

- Import: `import { tanstackStart } from '@tanstack/react-start/plugin/vite'`
- Plugin order in `vite.config.ts`: `tanstackStart()` MUST come **before** `react()`
- Build commands: `vite dev` / `vite build` (output in `.output/`)
- Server start: `node .output/server/index.mjs`
- No `index.html` needed — TanStack Start renders the full HTML document via SSR

```ts
// vite.config.ts — correct
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [tanstackStart(), react(), tailwindcss()],
}
```

❌ **Wrong (old vinxi pattern — do NOT use):**
```ts
// app.config.ts with defineConfig from '@tanstack/react-start/config'
// scripts: "vinxi dev" / "vinxi build"
```

## Router Factory

The function in `src/router.tsx` **MUST be named `getRouter`** — this name is hardcoded in the route tree footer generator. If named anything else (e.g. `createRouter`), the TypeScript `Register` declaration breaks.

```ts
// src/router.tsx
export function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true })
}
```

## Source & Route Directory

- `srcDirectory` defaults to `"src"` — routes go in `src/routes/`
- Override with `tanstackStart({ srcDirectory: 'app' })` if needed
- `routeTree.gen.ts` is **auto-generated** by the Vite plugin on first `vite build` or `vite dev`

## File-Based Routing

- Path string in `createFileRoute` must exactly match the filename pattern
- `city.$cityId.tsx` → `createFileRoute('/city/$cityId')`
- Use `Route.useParams()` for typed param access (not `useParams()` from the router directly)

```ts
// src/routes/city.$cityId.tsx
export const Route = createFileRoute('/city/$cityId')({ component: CityPage })
function CityPage() {
  const { cityId } = Route.useParams()
}
```

## Root Route

The root route renders the **full HTML document**. `HeadContent` and `Scripts` come from `@tanstack/react-router`, NOT `@tanstack/react-start`.

```tsx
// src/routes/__root.tsx
import { createRootRoute, HeadContent, Scripts, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({ meta: [{ title: 'My App' }] }),
  component: () => (
    <html>
      <head><HeadContent /></head>
      <body><Outlet /><Scripts /></body>
    </html>
  ),
})
```

## Entry Points

The plugin provides virtual entry modules — **no manual `client.tsx` or `ssr.tsx` needed**:
- `virtual:tanstack-start-client-entry`
- `virtual:tanstack-start-server-entry`

## Tailwind CSS v4

- Use `@tailwindcss/vite` plugin — no `tailwind.config.js` needed
- CSS file only needs `@import "tailwindcss"`
- Import the CSS in `src/routes/__root.tsx`

## tsconfig Notes

- `tsconfig.app.json` → `include: ["src"]`
- `tsconfig.node.json` → `include: ["vite.config.ts"]` (NOT `app.config.ts`)

## Server Functions (`createServerFn`)

Import from `@tanstack/react-start` — it re-exports from `@tanstack/start-client-core` which lives in pnpm's nested `node_modules/.pnpm/` and is NOT directly visible at `node_modules/@tanstack/start-client-core`. Do NOT spend time searching for it — the import path is correct.

```ts
import { createServerFn } from '@tanstack/react-start'
```

The builder API chain is: `.inputValidator()` → `.handler()` (optionally preceded by `.middleware()`).

❌ **Wrong — `.validator()` does not exist:**
```ts
createServerFn().validator(...).handler(...)  // Property 'validator' does not exist
```

✅ **Correct — use `.inputValidator()`:**
```ts
export const getWeatherFn = createServerFn()
  .inputValidator((input: { lat: number; lon: number; timezone: string }) => input)
  .handler(({ data }) => fetchWeather(data.lat, data.lon, data.timezone))
```

The handler receives `ctx` — destructure `{ data }` to get the validated input.

## Router Context + TanStack Query Prefetching

To pass `queryClient` through router context and prefetch in loaders:

**`src/router.tsx`** — create and export `queryClient`, pass as `context`:
```ts
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export interface RouterContext { queryClient: QueryClient }

export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 10, retry: 2 } } })

export function getRouter() {
  return createRouter({ routeTree, context: { queryClient }, scrollRestoration: true, defaultPreload: 'intent' })
}
```

**`src/routes/__root.tsx`** — swap `createRootRoute` → `createRootRouteWithContext`, get `queryClient` from context:
```tsx
import { createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'

interface RouterContext { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootComponent })

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

**Route loader** — prefetch with `ensureQueryData`:
```ts
export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) =>
    Promise.all(CITIES.map((city) => queryClient.ensureQueryData(weatherQueryOptions(city)))),
  component: HomePage,
})
```

**Shared `queryOptions` factory** (define alongside server fn, use in both loader and `useQuery`):
```ts
import { queryOptions } from '@tanstack/react-query'

export function weatherQueryOptions(city: City) {
  return queryOptions({
    queryKey: ['weather', city.id],
    queryFn: () => getWeatherFn({ data: { lat: city.lat, lon: city.lon, timezone: city.timezone } }),
    staleTime: 1000 * 60 * 10,
  })
}
```

## Versions (tested working)

| Package | Version |
|---|---|
| `@tanstack/react-start` | 1.167.65 |
| `@tanstack/react-router` | 1.169.2 |
| `@tanstack/react-query` | 5.100.10 |
| `zustand` | 5.0.13 |
| `tailwindcss` | 4.x |
| `vite` | 8.x |
| `react` | 19.x |
