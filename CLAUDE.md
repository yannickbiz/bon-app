# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production with Turbopack
pnpm start        # Start production server
```

### Code Quality
```bash
pnpm lint         # Run Biome linter
pnpm format       # Auto-fix formatting with Biome
```

### Testing
```bash
pnpm test                    # Run all tests with Vitest
pnpm test -- <file-path>     # Run specific test file
pnpm test:ui                 # Open Vitest UI for interactive testing
pnpm test:coverage           # Generate coverage report
```

### Database (Drizzle ORM)
```bash
pnpm db:generate    # Generate migrations from schema
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema changes directly (dev only)
pnpm db:studio      # Open Drizzle Studio GUI
```

## Architecture

### Authentication System
**Stack**: Supabase Auth with SSR support

The authentication system uses a dual-client pattern:
- **Server components** (`lib/supabase/server.ts`): Uses `createServerClient` with Next.js cookies API
- **Client components** (`lib/supabase/client.ts`): Uses `createBrowserClient` for client-side operations
- **Middleware** (`lib/supabase/middleware.ts`): Session refresh handler called from root `middleware.ts`

**Auth Flow**:
1. Root `middleware.ts` intercepts all requests (except public routes and static assets)
2. Calls `updateSession()` to refresh Supabase auth session
3. Public routes defined in `middleware.ts`: `/login`, `/signup`, `/verify`, `/reset-password`, `/auth/callback`
4. Protected routes are wrapped with `(protected)` route group which has a layout that verifies auth
5. Unauthenticated users are redirected to `/login` with `?next=` parameter for return URL

**Auth Methods Supported**:
- Magic link (passwordless email)
- Email/password
- Password reset flow

### Route Groups & Layouts

```
app/
├── (auth)/              # Public auth pages
│   ├── login/
│   ├── signup/
│   ├── verify/
│   └── reset-password/
├── (protected)/         # Protected routes requiring auth
│   ├── layout.tsx      # Server-side auth check + redirect
│   └── profile/
└── layout.tsx          # Root layout with ThemeProvider
```

The `(auth)` and `(protected)` folder names are route groups (not in URL path). The `(protected)/layout.tsx` performs server-side auth verification before rendering any protected pages.

### Theme System
**Stack**: next-themes + Tailwind CSS v4 + shadcn/ui

- Theme provider wraps entire app in `app/layout.tsx`
- CSS variables defined in `app/globals.css` for light/dark modes
- Theme toggle component in `components/theme/theme-toggle.tsx`
- Supports system/light/dark theme modes
- Custom semantic colors: `success`, `warning`, `info`, `destructive`

### UI Components
**Stack**: shadcn/ui (new-york style) + Radix UI primitives

Component organization:
- `components/ui/` - shadcn/ui components
- `components/theme/` - Theme-related components
- `components/navigation/` - Navigation components

Installed components: button, input, label, card, dropdown-menu, avatar, sonner (toast), dialog, select, tabs, separator, skeleton

### Path Aliases
Use `@/*` for imports from project root:
```typescript
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
```

### Testing Strategy
**Stack**: Vitest + React Testing Library + jsdom

- Tests colocated with components in `__tests__/` folders
- Each page has a corresponding test file (e.g., `login/__tests__/page.test.tsx`)
- Vitest config at `vitest.config.ts` with jsdom environment
- Setup file: `vitest.setup.ts`

### Database (Not Yet Implemented)
Drizzle ORM is configured but schema not yet created:
- Config: `drizzle.config.ts`
- Expected schema location: `db/schema.ts`
- Migrations will go in: `db/migrations/`

### AI-Assisted Development Workflow
This project follows Ryan Carson's 3-File System for structured AI development:

1. **create-prd.md** - Create detailed Product Requirements Document
2. **generate-tasks.md** - Break PRD into atomic parent/child tasks
3. **process-task-list.md** - Execute ONE task at a time using TDD

**Workflow**: Create PRD → Generate Tasks → Process Each Task (write tests first, then code) → Repeat

The templates are in `agent-prompts/` directory. See `agent-prompts/README.md` for full methodology.

## Environment Variables

Required variables (see `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Tech Stack Summary

- **Framework**: Next.js 15.5 (App Router, Turbopack, React 19)
- **Auth**: Supabase Auth with SSR
- **Database**: PostgreSQL (via Supabase) + Drizzle ORM (configured)
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style)
- **Theme**: next-themes with system/light/dark support
- **Code Quality**: Biome (linter + formatter)
- **Testing**: Vitest + React Testing Library
- **Package Manager**: pnpm
- **TypeScript**: Strict mode enabled

## Important Notes

- **Always use server-side auth checks** for protected routes (see `(protected)/layout.tsx`)
- **Client vs Server Supabase clients** are different - use the appropriate one
- **Route groups** `(auth)` and `(protected)` don't appear in URLs
- **Middleware runs on all routes** except those in `publicRoutes` array and static assets
- **Tests should be colocated** with components in `__tests__/` folders
- **Use TDD approach** when following the 3-File System workflow
