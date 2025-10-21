## Relevant Files

### Database & Schema
- `db/schema.ts` - Add todos table schema with user relationship
- `db/migrations/` - Generated migration files for todos table

### Server Actions
- `app/(protected)/todos/actions.ts` - Server actions for CRUD operations
- `app/(protected)/todos/__tests__/actions.test.ts` - Tests for server actions

### Validation & Utilities
- `lib/todos/validation.ts` - Todo validation logic (text length, empty check)
- `lib/todos/__tests__/validation.test.ts` - Tests for validation logic

### UI Components
- `app/(protected)/todos/page.tsx` - Main todos page (server component)
- `app/(protected)/todos/__tests__/page.test.tsx` - Tests for todos page
- `app/(protected)/todos/components/todo-input.tsx` - Client component for creating todos
- `app/(protected)/todos/components/todo-item.tsx` - Client component for individual todo item
- `app/(protected)/todos/components/todo-list.tsx` - Client component for todo list with filters
- `app/(protected)/todos/components/__tests__/todo-input.test.tsx` - Tests for todo input
- `app/(protected)/todos/components/__tests__/todo-item.test.tsx` - Tests for todo item
- `app/(protected)/todos/components/__tests__/todo-list.test.tsx` - Tests for todo list

### Types
- `types/todos.ts` - TypeScript types and interfaces for todos

## Notes

- Unit tests should be placed alongside code files in `__tests__/` folders
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests.
- Follow existing patterns: client components use `"use client"`, server components for data fetching
- Use server-side Supabase client (`@/lib/supabase/server`) for authentication checks in server actions
- Database schema follows existing Drizzle ORM patterns in `db/schema.ts`
- After schema changes, run `pnpm db:generate` to create migrations, then `pnpm db:migrate` to apply them
- Use optimistic UI updates for better UX (React's `useOptimistic` hook)
- Toast notifications should use the existing Sonner implementation

## Tasks

- [x] 1.0 Create feature branch
  - [x] 1.1 Ensure you're on the main branch and pull latest changes
  - [x] 1.2 Create a new branch named `feature/0004-todo-list`
  - [x] 1.3 Verify the branch was created successfully

- [x] 2.0 Database schema and migration setup
  - [x] 2.1 Add `todos` table to `db/schema.ts` with all required fields (id, user_id, text, completed, created_at, updated_at)
  - [x] 2.2 Add foreign key relationship to profiles table on user_id
  - [x] 2.3 Add index on user_id for query performance
  - [x] 2.4 Add index on created_at for ordering
  - [x] 2.5 Run `pnpm db:generate` to create migration files
  - [x] 2.6 Review generated migration SQL for correctness
  - [x] 2.7 Run `pnpm db:migrate` to apply migration to database
  - [x] 2.8 Verify table was created successfully (can use `pnpm db:studio` to inspect)

- [x] 3.0 Server actions implementation
  - [x] 3.1 Create `types/todos.ts` with TypeScript interfaces (Todo, CreateTodoInput, UpdateTodoInput, TodoFilter)
  - [x] 3.2 Create `lib/todos/validation.ts` with validation functions
  - [x] 3.3 Write tests for validation logic in `lib/todos/__tests__/validation.test.ts` (TDD approach)
  - [x] 3.4 Implement validation logic to pass tests (text length 1-500, no whitespace-only)
  - [x] 3.5 Create `app/(protected)/todos/actions.ts` file
  - [x] 3.6 Implement `createTodo(text: string)` server action with auth check and validation
  - [x] 3.7 Implement `getTodos(filter?: TodoFilter)` server action with auth check and filtering
  - [x] 3.8 Implement `updateTodo(id: string, updates: UpdateTodoInput)` server action with auth and ownership check
  - [x] 3.9 Implement `deleteTodo(id: string)` server action with auth and ownership check
  - [x] 3.10 Write tests for server actions in `app/(protected)/todos/__tests__/actions.test.ts`
  - [x] 3.11 Ensure all server actions have proper error handling and return consistent response format

- [ ] 4.0 UI components and page implementation
  - [ ] 4.1 Create `app/(protected)/todos/page.tsx` as server component
  - [ ] 4.2 Implement initial data loading in page.tsx using `getTodos()` action
  - [ ] 4.3 Add page header with "My Todos" title
  - [ ] 4.4 Create `app/(protected)/todos/components/todo-input.tsx` client component
  - [ ] 4.5 Implement form with input field and submit button in todo-input.tsx
  - [ ] 4.6 Add client-side validation and loading state to todo-input
  - [ ] 4.7 Implement createTodo action call with optimistic update in todo-input
  - [ ] 4.8 Create `app/(protected)/todos/components/todo-item.tsx` client component
  - [ ] 4.9 Implement checkbox, todo text display, edit button, and delete button in todo-item
  - [ ] 4.10 Add visual styling for completed todos (strikethrough, muted color)
  - [ ] 4.11 Implement inline editing with Dialog component for edit functionality
  - [ ] 4.12 Implement delete with confirmation and optimistic update
  - [ ] 4.13 Implement toggle completion with optimistic update
  - [ ] 4.14 Create `app/(protected)/todos/components/todo-list.tsx` client component
  - [ ] 4.15 Implement Tabs component for filters (All, Active, Completed)
  - [ ] 4.16 Add filtering logic based on selected tab
  - [ ] 4.17 Implement empty state message when no todos match filter
  - [ ] 4.18 Add loading skeleton states using Skeleton component
  - [ ] 4.19 Integrate all components in page.tsx with proper data flow
  - [ ] 4.20 Ensure responsive design works on mobile, tablet, and desktop

- [ ] 5.0 Testing implementation
  - [ ] 5.1 Write tests for todo-input component in `__tests__/todo-input.test.tsx`
  - [ ] 5.2 Test form submission, validation, and error states in todo-input
  - [ ] 5.3 Write tests for todo-item component in `__tests__/todo-item.test.tsx`
  - [ ] 5.4 Test checkbox toggle, edit, and delete functionality in todo-item
  - [ ] 5.5 Write tests for todo-list component in `__tests__/todo-list.test.tsx`
  - [ ] 5.6 Test filter tabs and empty states in todo-list
  - [ ] 5.7 Write integration tests for page.tsx in `__tests__/page.test.tsx`
  - [ ] 5.8 Test full user flow: create, edit, complete, delete todos
  - [ ] 5.9 Test edge cases: max length text, whitespace-only input, concurrent updates
  - [ ] 5.10 Run `pnpm test` and ensure all tests pass
  - [ ] 5.11 Run `pnpm test:coverage` and review coverage report

- [ ] 6.0 Integration and polish
  - [ ] 6.1 Add toast notifications for all user actions (create, update, delete) using Sonner
  - [ ] 6.2 Implement proper error handling with user-friendly messages
  - [ ] 6.3 Add loading states for all async operations
  - [ ] 6.4 Verify optimistic updates work correctly with rollback on error
  - [ ] 6.5 Test authentication flow (redirect to login if not authenticated)
  - [ ] 6.6 Test user isolation (users can only see their own todos)
  - [ ] 6.7 Verify responsive design on different screen sizes
  - [ ] 6.8 Test light/dark theme compatibility
  - [ ] 6.9 Run `pnpm lint` and fix any linting errors
  - [ ] 6.10 Run `pnpm format` to ensure consistent formatting
  - [ ] 6.11 Run full test suite one final time (`pnpm test`)
  - [ ] 6.12 Manual testing: create, edit, complete, filter, delete todos
  - [ ] 6.13 Review accessibility (keyboard navigation, screen reader support)
  - [ ] 6.14 Commit all changes with descriptive commit message following conventional commits format
