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

## AI-Assisted Development

This project uses Ryan Carson's 3-File System for structured AI development.

**TL;DR:** A structured workflow to reduce bugs when using AI to code:

1. **create-prd.md** - Creates detailed Product Requirements Document (PRD) with technical specs
2. **generate-tasks.md** - Breaks PRD into small, atomic parent/child tasks  
3. **process-task-list.md** - Executes ONE task at a time using test-driven development (TDD)

**Workflow:** Create PRD → Generate Tasks → Process Each Task (write tests first, then code) → Repeat

**Key Benefits:**
- Reduces AI hallucinations by limiting scope to one task at a time
- Enforces TDD (tests before implementation)
- Creates automatic documentation
- Prevents scope creep through linear, focused progression

See [agent-prompts/README.md](./agent-prompts/README.md) for the complete workflow and methodology.
