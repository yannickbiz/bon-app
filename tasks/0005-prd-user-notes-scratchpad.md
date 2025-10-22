# PRD: User Notes/Scratchpad Feature

## Introduction/Overview

The User Notes/Scratchpad feature provides authenticated users with a personal workspace to capture quick thoughts, ideas, reminders, and draft content. This addresses the common need for users to have a persistent, private space within the application to jot down information without needing external tools. The feature will be seamlessly integrated into the existing application with auto-save functionality and rich text support.

**Problem it solves**: Users often need to quickly capture information while using the application but have no built-in place to store temporary or persistent notes. This leads to context-switching to external note-taking apps or losing valuable thoughts.

## Goals

1. Provide users with an intuitive, fast way to create and manage personal notes
2. Ensure zero data loss through auto-save functionality
3. Deliver a rich editing experience with markdown support
4. Enable easy organization through multiple notes with search capabilities
5. Maintain fast load times and responsive UI even with many notes
6. Achieve >90% user satisfaction based on post-release survey

## User Stories

1. **As a user**, I want to quickly create a new note so that I can capture ideas immediately without friction.

2. **As a user**, I want my notes to auto-save so that I never lose content due to accidental navigation or browser crashes.

3. **As a user**, I want to write notes using markdown so that I can format my content with headings, lists, bold/italic text, and code blocks.

4. **As a user**, I want to organize multiple notes with titles so that I can keep different topics separate and find them easily.

5. **As a user**, I want to search through my notes so that I can quickly find specific information I wrote previously.

6. **As a user**, I want to pin important notes so that they stay at the top of my list for quick access.

7. **As a user**, I want to delete notes I no longer need so that my workspace stays clean and organized.

8. **As a user**, I want my notes to be private and secure so that sensitive information stays confidential.

9. **As a user**, I want to access my notes from any device so that my information is always available when I need it.

10. **As a user**, I want to see timestamps on my notes so that I know when I created or last modified them.

## Functional Requirements

### Core Note Management

1. The system must allow authenticated users to create unlimited notes (subject to reasonable storage limits per user).

2. Each note must have:
   - A required title (max 100 characters)
   - Content area supporting markdown syntax (max 50,000 characters per note)
   - Created timestamp (auto-generated)
   - Last modified timestamp (auto-updated)
   - Pinned status (boolean, default: false)

3. The system must display notes in a list view showing:
   - Note title
   - First 100 characters of content (preview)
   - Last modified timestamp
   - Pinned indicator (if applicable)

4. The system must sort notes with pinned notes first, then by last modified date (most recent first).

5. The system must provide a markdown editor with:
   - Live preview toggle
   - Support for: headings (h1-h6), bold, italic, lists (ordered/unordered), links, code blocks, inline code, blockquotes
   - Syntax highlighting for code blocks

### Auto-Save

6. The system must auto-save note content every 2 seconds after the user stops typing (debounced).

7. The system must display a visual indicator showing save status:
   - "Saving..." while save is in progress
   - "Saved at [time]" when save completes
   - "Error saving" if save fails with retry option

8. The system must save notes optimistically on the client and sync with the server asynchronously.

### Search & Filter

9. The system must provide a search bar that filters notes by:
   - Title (case-insensitive partial match)
   - Content (case-insensitive partial match)

10. The system must update search results in real-time as the user types (debounced by 300ms).

### Note Actions

11. The system must allow users to:
    - Create a new blank note
    - Edit existing notes (title and content)
    - Delete notes (with confirmation dialog)
    - Pin/unpin notes
    - Duplicate notes (creates copy with " - Copy" appended to title)

12. The system must implement soft delete for notes:
    - Deleted notes move to "Trash" state
    - Trash is accessible via separate view
    - Notes in trash can be restored or permanently deleted
    - Notes auto-permanently-delete after 30 days in trash

### UI/Navigation

13. The system must add a "Notes" navigation item in the main application navigation bar.

14. The notes page must use a two-panel layout:
    - Left panel: Note list (30% width, scrollable)
    - Right panel: Note editor (70% width)
    - Responsive: Stack vertically on mobile (<768px width)

15. The system must provide a keyboard shortcut (Ctrl/Cmd + K) to:
    - Open notes page if not already there
    - Focus the search bar if already on notes page

### Security & Privacy

16. The system must ensure notes are only accessible by their owner (the user who created them).

17. The system must validate note ownership on all API endpoints (create, read, update, delete).

18. The system must sanitize markdown content server-side to prevent XSS attacks.

### Performance

19. The system must load the notes list in under 1 second for users with up to 500 notes.

20. The system must paginate or virtualize the note list to maintain performance with large note counts.

## Non-Goals (Out of Scope)

1. **Sharing notes with other users** - Notes are private only. Collaboration features may be considered in future iterations.

2. **Offline access** - Notes require an active internet connection. Offline support adds significant complexity and is not required for MVP.

3. **Rich media embeds** - No support for images, videos, or file attachments in this version. Markdown links are supported.

4. **Version history** - No ability to view or restore previous versions of notes. Only current state is saved.

5. **Folders/categories** - No hierarchical organization. Search and pinning provide sufficient organization for MVP.

6. **Export functionality** - No ability to export notes to PDF, Word, or other formats in this version.

7. **Third-party integrations** - No integration with external note-taking apps (Notion, Evernote, etc.).

8. **Tags or labels** - Simple search is sufficient; tagging system adds complexity without proven user need.

## Design Considerations

### UI Components

- Reuse existing shadcn/ui components:
  - `Input` for note title
  - `Textarea` or custom markdown editor for content
  - `Button` for actions
  - `Card` for note list items
  - `Dialog` for delete confirmation
  - `Skeleton` for loading states
  - `Separator` for visual dividers

### Theme Support

- Must support both light and dark themes using existing next-themes configuration
- Markdown preview should adapt to current theme
- Code blocks should use appropriate syntax highlighting theme

### Responsive Design

- Desktop (>768px): Two-panel side-by-side layout
- Mobile (<768px): Single panel with back button to return to list from editor
- Touch-friendly tap targets (min 44x44px)

### Loading States

- Show skeleton loaders while notes list loads
- Disable editor while note is being loaded
- Show inline spinners for actions (delete, pin, duplicate)

## Technical Considerations

### Database Schema (Drizzle ORM)

Create `notes` table with columns:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to Supabase auth.users)
- `title` (varchar 100)
- `content` (text)
- `is_pinned` (boolean, default false)
- `is_deleted` (boolean, default false, for soft delete)
- `deleted_at` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Indexes:
- `user_id` (for filtering by user)
- `user_id, is_deleted, is_pinned, updated_at` (composite for main query)

### API Endpoints

- `GET /api/notes` - List all notes for current user (exclude deleted)
- `GET /api/notes/trash` - List deleted notes for current user
- `GET /api/notes/[id]` - Get single note
- `POST /api/notes` - Create new note
- `PATCH /api/notes/[id]` - Update note (title, content, is_pinned)
- `DELETE /api/notes/[id]` - Soft delete note
- `POST /api/notes/[id]/restore` - Restore from trash
- `DELETE /api/notes/[id]/permanent` - Permanently delete

### Authentication

- Use existing Supabase server-side auth pattern
- All API routes must verify user authentication
- Use Row Level Security (RLS) policies in Supabase if using Supabase database
- Ensure note ownership validation on every request

### Markdown Library

- Recommended: `react-markdown` for rendering
- `remark-gfm` for GitHub Flavored Markdown support
- `react-syntax-highlighter` for code block highlighting

### Auto-Save Implementation

- Use `useDebouncedCallback` hook (300ms-2s debounce)
- Implement optimistic updates with rollback on error
- Show toast notification on save errors (using existing Sonner toast)

### Testing Strategy

- Unit tests for markdown parsing/rendering
- Integration tests for CRUD operations
- E2E tests for:
  - Creating and editing notes
  - Auto-save functionality
  - Search functionality
  - Pin/delete operations

## Success Metrics

1. **Adoption Rate**: >50% of active users create at least one note within first 30 days of feature launch

2. **Engagement**: Users who create notes return to edit them an average of 3+ times per week

3. **Performance**:
   - Initial page load <1s (p95)
   - Auto-save latency <500ms (p95)
   - Search results appear <200ms after typing stops

4. **Reliability**: <0.1% data loss incidents (failed saves that result in lost content)

5. **User Satisfaction**: >4.0/5.0 rating on post-feature survey question: "How satisfied are you with the notes feature?"

6. **Usage Growth**: 20% month-over-month growth in total notes created for first 6 months

## Open Questions

1. **Storage limits**: Should there be a hard limit on total notes per user or total storage per user? (Recommended: 1000 notes or 50MB per user for MVP)

2. **Trash auto-cleanup**: Should we notify users before permanently deleting notes from trash after 30 days?

3. **Initial empty state**: What should users see when they first visit the notes page with no notes? (Recommended: Onboarding card with feature overview and "Create your first note" CTA)

4. **Mobile keyboard handling**: Should the editor auto-focus on mobile or require tap to avoid keyboard pop-up?

5. **Analytics tracking**: Which user interactions should we track? (Recommended: note_created, note_deleted, note_pinned, note_searched, time_spent_editing)
