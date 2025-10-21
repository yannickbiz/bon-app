# Product Requirements Document: Todo List Feature

## Introduction/Overview

This feature adds a simple, user-friendly todo list to the application, allowing authenticated users to create, manage, and track their personal tasks. The todo list will integrate seamlessly with the existing Next.js application architecture, using Supabase for data persistence and shadcn/ui components for a consistent user experience.

**Problem Statement**: Users currently have no way to organize and track tasks or reminders within the application. A built-in todo list provides convenience and keeps users engaged within the app ecosystem.

**Goal**: Provide a lightweight, intuitive task management system that allows users to capture, organize, and complete tasks efficiently.

## Goals

1. Enable users to quickly capture and organize tasks
2. Provide a clean, distraction-free interface for task management
3. Persist todos securely in the database tied to user accounts
4. Maintain consistency with existing app design and architecture
5. Ensure responsive design works on mobile and desktop devices

## User Stories

1. **As a user**, I want to add new todos quickly so that I can capture tasks as they come to mind.

2. **As a user**, I want to mark todos as complete so that I can track my progress and feel accomplished.

3. **As a user**, I want to edit todo text so that I can fix typos or update task details.

4. **As a user**, I want to delete todos so that I can remove tasks that are no longer relevant.

5. **As a user**, I want to see only my own todos so that my task list remains private and organized.

6. **As a user**, I want to filter between active and completed todos so that I can focus on what needs to be done.

7. **As a user**, I want my todos to persist across sessions so that I don't lose my task list when I log out.

## Functional Requirements

### Core Functionality

1. **Create Todo**: Users must be able to add new todos with a text description (minimum 1 character, maximum 500 characters).

2. **Read Todos**: Users must be able to view a list of all their todos, ordered by creation date (newest first).

3. **Update Todo**: Users must be able to:
   - Edit the text of an existing todo
   - Toggle the completion status (complete/incomplete)

4. **Delete Todo**: Users must be able to permanently delete a todo from their list.

5. **Authentication Requirement**: Only authenticated users can access the todo list feature. Todos must be associated with the user's account.

6. **Data Persistence**: All todos must be stored in the Supabase PostgreSQL database using Drizzle ORM.

### User Interface Requirements

7. **Todo List Page**: Create a dedicated route at `/todos` within the protected route group.

8. **Input Field**: Provide a text input field with a submit button for creating new todos.

9. **Todo Items**: Each todo item must display:
   - Checkbox for completion status
   - Todo text
   - Edit button
   - Delete button

10. **Visual States**:
    - Completed todos should have visual differentiation (e.g., strikethrough text, muted color)
    - Empty state message when no todos exist

11. **Filter Tabs**: Provide tabs/filters to view:
    - All todos
    - Active (incomplete) todos only
    - Completed todos only

12. **Responsive Design**: The todo list must work seamlessly on mobile, tablet, and desktop screen sizes.

### Data Validation

13. **Required Field**: Todo text must not be empty (whitespace-only is invalid).

14. **Length Limits**: Todo text must be between 1 and 500 characters.

15. **User Isolation**: Users must only be able to view, edit, and delete their own todos (enforced at database and API level).

### User Feedback

16. **Loading States**: Show loading indicators during async operations (create, update, delete).

17. **Success Feedback**: Display toast notifications for successful actions (e.g., "Todo created", "Todo deleted").

18. **Error Handling**: Display user-friendly error messages for failures (e.g., network errors, validation errors).

19. **Optimistic Updates**: UI should update immediately for better perceived performance, with rollback on error.

## Non-Goals (Out of Scope)

1. **Collaboration/Sharing**: This feature will NOT support sharing todos with other users or collaborative task management.

2. **Due Dates/Reminders**: No calendar integration, due dates, or notification system.

3. **Priority Levels**: No priority ranking or color-coding system.

4. **Categories/Tags**: No tagging or categorization system beyond completion status.

5. **Subtasks**: No nested todos or subtask functionality.

6. **Drag-and-Drop Reordering**: No manual reordering of todos (sorted by creation date only).

7. **Attachments**: No file uploads or image attachments.

8. **Rich Text Editing**: Todo descriptions are plain text only (no markdown, formatting, or links).

9. **Recurring Tasks**: No support for recurring or repeating todos.

10. **Analytics/Insights**: No productivity metrics, completion statistics, or reporting.

## Design Considerations

### UI Components

- Use existing shadcn/ui components: `Input`, `Button`, `Checkbox`, `Card`, `Tabs`, `Dialog` (for edit modal)
- Use `Sonner` for toast notifications
- Follow the existing "new-york" style theme

### Layout

- Page layout should follow existing protected route patterns
- Header with page title "My Todos"
- Input field at top for quick task creation
- Filter tabs below input
- Todo list as scrollable content area
- Empty state illustration/message when no todos

### Theming

- Respect light/dark mode from existing theme system
- Use semantic color variables (e.g., `muted` for completed todos)
- Maintain consistent spacing and typography with the rest of the app

## Technical Considerations

### Database Schema

Create a `todos` table with the following structure:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users, indexed)
- `text` (VARCHAR(500), not null)
- `completed` (BOOLEAN, default false)
- `created_at` (TIMESTAMP, default now())
- `updated_at` (TIMESTAMP, auto-update on change)

### API/Data Layer

- Create Drizzle schema in `db/schema.ts`
- Implement server actions in `app/(protected)/todos/actions.ts` for:
  - `createTodo(text: string)`
  - `getTodos(filter?: 'all' | 'active' | 'completed')`
  - `updateTodo(id: string, updates: { text?: string, completed?: boolean })`
  - `deleteTodo(id: string)`
- Use server-side Supabase client for authentication checks
- Ensure RLS (Row Level Security) policies in Supabase for user isolation

### Client-Side Implementation

- Use React Server Components for initial data loading
- Client components for interactive elements (input, checkboxes, buttons)
- Use React `useTransition` or `useOptimistic` for optimistic updates
- Form handling with proper validation

### Testing Requirements

- Unit tests for validation logic
- Integration tests for server actions
- Component tests for UI interactions
- Test edge cases: empty todos, long text, concurrent updates

### Performance

- Limit initial query to most recent 100 todos (paginate if needed in future)
- Use database indexes on `user_id` and `created_at`
- Implement debouncing for edit operations if inline editing is used

### Security

- Server-side authentication checks on all actions
- SQL injection prevention (handled by Drizzle ORM)
- XSS prevention (React escapes by default)
- CSRF protection (Next.js built-in for server actions)

## Success Metrics

1. **Feature Adoption**: At least 40% of active users create at least one todo within first week of launch.

2. **Engagement**: Users who create todos return to the todos page an average of 3+ times per week.

3. **Task Completion**: Average completion rate of 60% or higher for created todos.

4. **Performance**: Page load time under 500ms, action response time under 200ms.

5. **Error Rate**: Less than 1% error rate for CRUD operations.

6. **User Satisfaction**: Positive feedback from user testing or surveys (if collected).

## Open Questions

1. Should there be a maximum limit on the number of todos a user can create (e.g., 1000)?

2. Do we want to implement soft delete (archive) instead of hard delete for data recovery?

3. Should completed todos auto-archive after a certain period (e.g., 30 days)?

4. Do we need bulk operations (e.g., "Delete all completed" or "Mark all as complete")?

5. Should we add keyboard shortcuts for power users (e.g., Ctrl+Enter to create, Escape to cancel)?

6. Is there a specific empty state illustration or copy that fits the app's brand voice?

7. Should the todos page be linked from the main navigation, or is it a "hidden" feature accessible via direct URL?

## Implementation Notes for Developers

- Follow the existing auth patterns in `(protected)/layout.tsx` for route protection
- Use `createClient()` from `@/lib/supabase/server` for server-side data fetching
- Colocate tests in `__tests__/` folders as per project conventions
- Follow TDD approach: write tests first, then implementation
- Run `pnpm db:generate` and `pnpm db:migrate` after creating schema
- Ensure Biome formatting passes before committing (`pnpm format`)
- Use the project's path aliases (`@/*`) for imports
