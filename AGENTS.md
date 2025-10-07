# Agent Guidelines for bon-app

## Build/Lint/Test Commands
- **Dev**: `npm run dev` (uses Turbopack)
- **Build**: `npm run build --turbopack`
- **Lint**: `npm run lint` (Biome linter)
- **Format**: `npm run format` (auto-fix formatting)
- **Test**: `npm run test` (Vitest)
- **Test UI**: `npm run test:ui` (Vitest UI mode)
- **Test Coverage**: `npm run test:coverage` (with coverage report)

## Database Commands (Drizzle ORM + Supabase)
- **Generate migrations**: `npm run db:generate` (create migration files from schema)
- **Run migrations**: `npm run db:migrate` (apply migrations to database)
- **Push schema**: `npm run db:push` (push schema directly without migrations)
- **Drizzle Studio**: `npm run db:studio` (browse and edit database)

## Code Style
- **Linter/Formatter**: Biome (not ESLint/Prettier)
- **Indentation**: 2 spaces
- **Imports**: Auto-organize via Biome; use `@/` alias for root directory
- **TypeScript**: Strict mode enabled; always type props and exports
- **Naming**: camelCase for variables/functions; PascalCase for components/types
- **Components**: Use `export default function ComponentName()` pattern
- **Framework**: Next.js 15 App Router with React 19, Tailwind CSS v4
- **Error Handling**: TypeScript strict checks; no try-catch unless async/external calls
- **Files**: `.tsx` for components, `.ts` for utilities

## Testing Guidelines
- **Test Location**: Place tests in `__tests__/` directories next to the code being tested
- **Naming**: Use `.test.tsx` for component tests, `.test.ts` for utilities
- **Framework**: Vitest with @testing-library/react for components
- **Globals**: Vitest globals enabled (describe, it, expect available without imports)

## After Code Changes
Always run `npm run lint` and `npm run test` to ensure code passes checks.
