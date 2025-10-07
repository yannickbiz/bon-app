# bon-app

A modern Next.js application built with the latest tools and best practices.

## Tech Stack

- **Next.js 15.5** - React framework with App Router and Turbopack
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Strict type checking
- **Tailwind CSS 4** - Utility-first CSS framework
- **Biome** - Fast linter and formatter (replaces ESLint/Prettier)
- **Vitest** - Fast unit testing with React Testing Library
- **pnpm** - Fast, disk-efficient package manager

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter
- `pnpm format` - Auto-fix formatting issues
- `pnpm test` - Run tests with Vitest
- `pnpm test:ui` - Open Vitest UI
- `pnpm test:coverage` - Run tests with coverage report

## Project Structure

```
app/              App Router pages and layouts
  __tests__/      Component tests
public/           Static assets
```

## Code Style

- 2-space indentation
- Biome for linting and formatting
- Path alias `@/` for root directory imports
- TypeScript strict mode enabled
