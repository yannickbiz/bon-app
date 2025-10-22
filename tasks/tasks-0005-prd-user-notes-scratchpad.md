# Task List: User Notes/Scratchpad Feature

## Relevant Files

### Database & Schema
- `db/schema.ts` - Add notes table definition with proper indexes and relations
- `db/index.ts` - Export notes table for use in queries (already configured)
- `drizzle.config.ts` - Migration configuration (already configured)

### Types & Validation
- `types/notes.ts` - TypeScript types for Note, NoteActionResult, CreateNoteInput, UpdateNoteInput
- `lib/notes/validation.ts` - Validation functions for note title and content
- `lib/notes/__tests__/validation.test.ts` - Unit tests for validation functions

### Server Actions
- `app/(protected)/notes/actions.ts` - Server actions for CRUD operations (createNote, updateNote, deleteNote, etc.)
- `app/(protected)/notes/__tests__/actions.test.ts` - Integration tests for server actions

### UI Components
- `app/(protected)/notes/components/note-list.tsx` - Note list with filtering and search (client component)
- `app/(protected)/notes/components/note-item.tsx` - Individual note item in the list (client component)
- `app/(protected)/notes/components/note-editor.tsx` - Markdown editor with preview toggle (client component)
- `app/(protected)/notes/components/note-input.tsx` - Create new note input/dialog (client component)
- `app/(protected)/notes/components/save-indicator.tsx` - Auto-save status indicator (client component)
- `app/(protected)/notes/components/empty-state.tsx` - Empty state for no notes (client component)
- `app/(protected)/notes/components/__tests__/note-list.test.tsx` - Component tests
- `app/(protected)/notes/components/__tests__/note-item.test.tsx` - Component tests
- `app/(protected)/notes/components/__tests__/note-editor.test.tsx` - Component tests

### Pages & Routes
- `app/(protected)/notes/page.tsx` - Main notes page with two-panel layout (server component)
- `app/(protected)/notes/trash/page.tsx` - Trash view for deleted notes (server component)
- `app/(protected)/notes/__tests__/page.test.tsx` - Page component tests

### Navigation
- `components/navigation/navbar.tsx` - Add "Notes" navigation link (modify existing)

### Utilities
- `lib/notes/markdown.ts` - Markdown sanitization and rendering utilities
- `lib/notes/__tests__/markdown.test.ts` - Unit tests for markdown utilities

### Hooks (if needed)
- `hooks/use-debounced-callback.ts` - Debounced callback hook for auto-save (create if doesn't exist)
- `hooks/use-keyboard-shortcut.ts` - Keyboard shortcut hook for Ctrl/Cmd+K (create if doesn't exist)

### Notes
- Unit tests should be placed in `__tests__/` folders alongside the code they test
- Use `pnpm test` to run all tests, or `pnpm test <path>` for specific test files
- All components in `app/(protected)/notes/components/` should be client components (`"use client"`)
- Server actions in `actions.ts` must have `"use server"` directive
- Follow the existing todos feature pattern for consistency

## Tasks

- [x] 1.0 Create feature branch
  - [x] 1.1 Create a new branch from `main` named `feature/0005-user-notes-scratchpad`
  - [x] 1.2 Verify branch is created and checked out successfully

- [x] 2.0 Set up database schema and migrations for notes
  - [x] 2.1 Add `notes` table to `db/schema.ts` with columns: id (uuid), user_id (uuid FK), title (varchar 100), content (text), is_pinned (boolean), is_deleted (boolean), deleted_at (timestamp), created_at (timestamp), updated_at (timestamp)
  - [x] 2.2 Add indexes: primary key on id, index on user_id, composite index on (user_id, is_deleted, is_pinned, updated_at)
  - [x] 2.3 Add foreign key relation to profiles table for user_id
  - [x] 2.4 Generate migration using `pnpm db:generate`
  - [x] 2.5 Review generated migration file for correctness
  - [x] 2.6 Run migration using `pnpm db:migrate` to apply schema changes
  - [x] 2.7 Verify table creation in database using `pnpm db:studio`

- [x] 3.0 Create types, validation, and server actions for note operations
  - [x] 3.1 Create `types/notes.ts` with Note type, NoteActionResult<T>, CreateNoteInput, UpdateNoteInput types
  - [x] 3.2 Create `lib/notes/validation.ts` with validateNoteTitle and validateNoteContent functions
  - [x] 3.3 Write tests in `lib/notes/__tests__/validation.test.ts` for validation edge cases (empty, too long, special characters)
  - [x] 3.4 Create `app/(protected)/notes/actions.ts` with "use server" directive
  - [x] 3.5 Implement getNotes() server action - fetch all non-deleted notes for current user, sorted by pinned then updated_at
  - [x] 3.6 Implement getNote(id: string) server action - fetch single note with ownership verification
  - [x] 3.7 Implement createNote(input: CreateNoteInput) server action - validate, insert, and return new note
  - [x] 3.8 Implement updateNote(id: string, input: UpdateNoteInput) server action - validate ownership, update title/content/is_pinned
  - [x] 3.9 Implement deleteNote(id: string) server action - soft delete (set is_deleted=true, deleted_at=now)
  - [x] 3.10 Implement togglePinNote(id: string) server action - toggle is_pinned status
  - [x] 3.11 Implement duplicateNote(id: string) server action - create copy with " - Copy" appended to title
  - [x] 3.12 Implement getTrashedNotes() server action - fetch deleted notes for trash view
  - [x] 3.13 Implement restoreNote(id: string) server action - restore from trash (set is_deleted=false, deleted_at=null)
  - [x] 3.14 Implement permanentlyDeleteNote(id: string) server action - hard delete from database
  - [x] 3.15 Add revalidatePath calls to all mutating actions for cache invalidation
  - [x] 3.16 Run validation tests: `pnpm test lib/notes/__tests__/validation.test.ts`

- [x] 4.0 Implement core UI components (note list, note editor, note item)
  - [x] 4.1 Create `app/(protected)/notes/components/empty-state.tsx` - display when no notes exist with "Create your first note" CTA
  - [x] 4.2 Create `app/(protected)/notes/components/note-item.tsx` - display note title, preview (first 100 chars), timestamp, pin indicator
  - [x] 4.3 Add click handler to note-item for selecting/opening note in editor
  - [x] 4.4 Add pin/unpin button to note-item with icon toggle
  - [x] 4.5 Add delete button to note-item with confirmation dialog (using shadcn Dialog)
  - [x] 4.6 Create `app/(protected)/notes/components/note-input.tsx` - dialog or inline form to create new note with title input
  - [x] 4.7 Create `app/(protected)/notes/components/note-editor.tsx` - markdown editor with title input and content textarea
  - [x] 4.8 Add markdown preview toggle to note-editor (use react-markdown for rendering)
  - [x] 4.9 Add syntax highlighting to code blocks in preview (use react-syntax-highlighter)
  - [x] 4.10 Create `app/(protected)/notes/components/save-indicator.tsx` - show "Saving...", "Saved at [time]", or "Error saving"
  - [x] 4.11 Integrate save-indicator into note-editor component
  - [x] 4.12 Add duplicate note action to note-item dropdown menu or button
  - [x] 4.13 Apply theme-aware styling to all components (support light/dark themes)
  - [x] 4.14 Ensure responsive design for mobile (<768px) - stack components vertically

- [ ] 5.0 Build notes page with two-panel layout and routing
  - [ ] 5.1 Create `app/(protected)/notes/page.tsx` as server component
  - [ ] 5.2 Fetch initial notes data using getNotes() server action
  - [ ] 5.3 Implement two-panel layout: left panel (30% width) for note list, right panel (70% width) for editor
  - [ ] 5.4 Make layout responsive: side-by-side on desktop (>768px), stacked on mobile with back button
  - [ ] 5.5 Add note-list component to left panel with initial notes data
  - [ ] 5.6 Add note-editor component to right panel with selected note state management
  - [ ] 5.7 Implement note selection logic - clicking note in list opens it in editor
  - [ ] 5.8 Add "Create Note" button at top of left panel using note-input component
  - [ ] 5.9 Handle empty state - show empty-state component when no notes exist
  - [ ] 5.10 Add loading skeletons for initial page load (use shadcn Skeleton component)
  - [ ] 5.11 Create `app/(protected)/notes/trash/page.tsx` for trash view
  - [ ] 5.12 Implement trash page with list of deleted notes, restore, and permanent delete actions
  - [ ] 5.13 Add navigation link/button to access trash from main notes page

- [ ] 6.0 Add advanced features (search, pin, trash, auto-save)
  - [ ] 6.1 Create `lib/notes/markdown.ts` with sanitizeMarkdown() function to prevent XSS
  - [ ] 6.2 Write tests in `lib/notes/__tests__/markdown.test.ts` for XSS prevention
  - [ ] 6.3 Add search input to top of note-list component
  - [ ] 6.4 Implement client-side search filtering by title and content (case-insensitive)
  - [ ] 6.5 Add debouncing to search input (300ms delay) using useDebouncedCallback
  - [ ] 6.6 Implement auto-save in note-editor using debounced callback (2 seconds after typing stops)
  - [ ] 6.7 Add optimistic updates to note-editor - update UI immediately, sync with server asynchronously
  - [ ] 6.8 Show save-indicator status during auto-save process
  - [ ] 6.9 Handle auto-save errors with toast notification and retry option (use Sonner)
  - [ ] 6.10 Implement pin/unpin functionality with optimistic updates in note-item
  - [ ] 6.11 Ensure notes list re-sorts when pin status changes (pinned notes at top)
  - [ ] 6.12 Add duplicate note functionality to note-item with toast confirmation
  - [ ] 6.13 Implement soft delete confirmation dialog in note-item
  - [ ] 6.14 Update note-list to exclude deleted notes from main view
  - [ ] 6.15 Run markdown tests: `pnpm test lib/notes/__tests__/markdown.test.ts`

- [ ] 7.0 Integrate notes navigation link and keyboard shortcuts
  - [ ] 7.1 Open `components/navigation/navbar.tsx` and add "Notes" link to navigation items
  - [ ] 7.2 Position Notes link appropriately in navbar (after Todos, before Profile)
  - [ ] 7.3 Create `hooks/use-keyboard-shortcut.ts` hook for keyboard shortcut handling
  - [ ] 7.4 Implement Ctrl/Cmd+K keyboard shortcut to navigate to notes page or focus search
  - [ ] 7.5 Add keyboard shortcut listener to notes page component
  - [ ] 7.6 Test keyboard shortcut works on both Windows/Linux (Ctrl+K) and Mac (Cmd+K)
  - [ ] 7.7 Ensure keyboard shortcut doesn't conflict with browser shortcuts

- [ ] 8.0 Write comprehensive tests for all components and actions
  - [ ] 8.1 Write tests in `lib/notes/__tests__/validation.test.ts` - validate edge cases, max length, empty strings
  - [ ] 8.2 Write tests in `lib/notes/__tests__/markdown.test.ts` - XSS prevention, markdown rendering
  - [ ] 8.3 Write tests in `app/(protected)/notes/__tests__/actions.test.ts` - CRUD operations, auth checks, ownership validation
  - [ ] 8.4 Write tests in `app/(protected)/notes/components/__tests__/note-list.test.tsx` - rendering, search, filtering
  - [ ] 8.5 Write tests in `app/(protected)/notes/components/__tests__/note-item.test.tsx` - click handlers, pin toggle, delete confirmation
  - [ ] 8.6 Write tests in `app/(protected)/notes/components/__tests__/note-editor.test.tsx` - markdown editing, preview toggle, auto-save
  - [ ] 8.7 Write tests in `app/(protected)/notes/__tests__/page.test.tsx` - page rendering, layout, empty state
  - [ ] 8.8 Run all tests: `pnpm test` and ensure 100% pass rate
  - [ ] 8.9 Generate coverage report: `pnpm test:coverage` and review coverage metrics
  - [ ] 8.10 Fix any failing tests and improve coverage for uncovered branches

- [ ] 9.0 Review, test end-to-end, and create pull request
  - [ ] 9.1 Run full build: `pnpm build` and fix any TypeScript or build errors
  - [ ] 9.2 Run linter: `pnpm lint` and fix any linting issues
  - [ ] 9.3 Run formatter: `pnpm format` to ensure consistent code style
  - [ ] 9.4 Test end-to-end user flows manually:
    - [ ] 9.4.1 Create a new note and verify it appears in the list
    - [ ] 9.4.2 Edit note content and verify auto-save works
    - [ ] 9.4.3 Pin a note and verify it moves to top of list
    - [ ] 9.4.4 Search for notes by title and content
    - [ ] 9.4.5 Delete a note and verify it moves to trash
    - [ ] 9.4.6 Restore a note from trash
    - [ ] 9.4.7 Permanently delete a note from trash
    - [ ] 9.4.8 Duplicate a note and verify copy is created
    - [ ] 9.4.9 Test keyboard shortcut (Ctrl/Cmd+K)
    - [ ] 9.4.10 Test responsive layout on mobile viewport
  - [ ] 9.5 Test dark mode and light mode theme switching
  - [ ] 9.6 Review all code for security issues (auth checks, XSS prevention, ownership validation)
  - [ ] 9.7 Commit all changes with descriptive commit messages following conventional commits format
  - [ ] 9.8 Push branch to remote: `git push -u origin feature/0005-user-notes-scratchpad`
  - [ ] 9.9 Create pull request with detailed description referencing PRD
  - [ ] 9.10 Request code review and address any feedback
