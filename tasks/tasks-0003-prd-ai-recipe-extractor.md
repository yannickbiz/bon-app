## Relevant Files

- `db/schema.ts` - Added recipes and user_recipes tables with constraints and indexes
- `db/migrations/0002_flimsy_captain_marvel.sql` - Generated migration file for recipes schema
- `.env.example` - Added AI recipe extraction environment variables
- `package.json` - Added ai, @ai-sdk/groq, fluent-ffmpeg dependencies
- `lib/ai/types.ts` - TypeScript interfaces for recipe extraction
- `lib/ai/schemas.ts` - Zod schemas for recipe validation
- `lib/ai/recipe-extractor.ts` - Core AI recipe extraction service using Groq
- `lib/ai/recipe-extractor.test.ts` - Unit tests for recipe extraction
- `lib/ai/recipe-extractor.ts` - Core AI recipe extraction service
- `lib/ai/recipe-extractor.test.ts` - Unit tests for recipe extraction logic
- `lib/ai/audio-transcription.ts` - Audio transcription service using Whisper API
- `lib/ai/audio-transcription.test.ts` - Unit tests for audio transcription
- `lib/ai/video-processor.ts` - Video download and audio extraction utilities
- `lib/ai/video-processor.test.ts` - Unit tests for video processing
- `lib/ai/types.ts` - TypeScript interfaces for recipe extraction
- `lib/ai/schemas.ts` - Zod schemas for recipe extraction validation
- `lib/scraper/database.ts` - Add recipe database operations (upsert, query functions)
- `lib/supabase/storage.ts` - Supabase Storage utilities for video/audio files
- `lib/supabase/storage.test.ts` - Unit tests for storage utilities
- `app/api/recipes/route.ts` - GET endpoint for listing recipes
- `app/api/recipes/route.test.ts` - Unit tests for recipes listing endpoint
- `app/api/recipes/[id]/route.ts` - GET endpoint for single recipe
- `app/api/recipes/[id]/route.test.ts` - Unit tests for single recipe endpoint
- `app/api/recipes/save/route.ts` - POST endpoint to save recipe to user collection
- `app/api/recipes/save/route.test.ts` - Unit tests for save recipe endpoint
- `app/api/recipes/save/[recipeId]/route.ts` - DELETE endpoint to unsave recipe
- `app/api/recipes/save/[recipeId]/route.test.ts` - Unit tests for unsave endpoint
- `app/api/recipes/[id]/edit/route.ts` - PUT endpoint to edit user's recipe
- `app/api/recipes/[id]/edit/route.test.ts` - Unit tests for edit recipe endpoint
- `app/api/recipes/my-collection/route.ts` - GET endpoint for user's saved recipes
- `app/api/recipes/my-collection/route.test.ts` - Unit tests for user collection endpoint
- `components/recipe/recipe-card.tsx` - Recipe display component
- `components/recipe/recipe-editor.tsx` - Recipe editing form component
- `components/recipe/recipe-collection.tsx` - User's recipe collection grid/list
- `components/recipe/save-recipe-button.tsx` - Save/unsave recipe button with auth
- `.env` - Add AI provider API keys and configuration

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Vitest configuration.

## Tasks

- [x] 1.0 Create feature branch
  - [x] 1.1 Create a new branch from `main` named `feature/0003-ai-recipe-extractor`

- [x] 2.0 Setup database schema and migrations for recipes
  - [x] 2.1 Add `recipes` table to `db/schema.ts` with fields: id (uuid), title, ingredients (jsonb), instructions (jsonb), scrapedContentId (foreign key), originalData (jsonb), confidence (decimal), aiProvider (text), transcription (text), createdAt, updatedAt
  - [x] 2.2 Add `user_recipes` junction table to `db/schema.ts` with fields: id (uuid), userId (uuid foreign key), recipeId (uuid foreign key), customTitle (text nullable), customIngredients (jsonb nullable), customInstructions (jsonb nullable), savedAt, updatedAt
  - [x] 2.3 Add unique constraint on recipes.scrapedContentId to prevent duplicate extractions
  - [x] 2.4 Add composite index on user_recipes (userId, recipeId) for fast lookups
  - [x] 2.5 Generate migration file using `npm run db:generate`
  - [x] 2.6 Review generated migration SQL file for correctness
  - [x] 2.7 Run migration using `npm run db:migrate` to apply schema changes to database

- [x] 3.0 Setup dependencies and environment configuration
  - [x] 3.1 Install Vercel AI SDK: `pnpm add ai @ai-sdk/groq`
  - [x] 3.2 Install audio processing dependencies: `pnpm add fluent-ffmpeg @types/fluent-ffmpeg`
  - [x] 3.3 Add environment variables to `.env.example`: GROQ_API_KEY, OPENAI_API_KEY (for Whisper), AI_PROVIDER (default: groq), MAX_VIDEO_DURATION_SECONDS (default: 300), SUPABASE_STORAGE_BUCKET (default: video-processing)
  - [x] 3.4 Create Supabase Storage bucket named `video-processing` with appropriate access policies (private bucket, authenticated access only for uploads)
  - [x] 3.5 Configure bucket lifecycle rules to auto-delete files older than 24 hours

- [x] 4.0 Implement AI recipe extraction service from text content
  - [x] 4.1 Create `lib/ai/types.ts` with TypeScript interfaces: RecipeExtractionResult, ExtractedRecipe, RecipeExtractionInput
  - [x] 4.2 Create `lib/ai/schemas.ts` with Zod schemas for recipe validation (title, ingredients array, instructions array) matching PRD structure
  - [x] 4.3 Create `lib/ai/recipe-extractor.ts` with main extraction function `extractRecipe(input: RecipeExtractionInput): Promise<RecipeExtractionResult>`
  - [x] 4.4 Implement AI provider abstraction using Vercel AI SDK with support for Groq initially
  - [x] 4.5 Design and implement AI prompt for recipe extraction using structured output (zod schema) with clear instructions for title, ingredients, and instructions extraction
  - [x] 4.6 Implement confidence scoring logic based on completeness of extracted data
  - [x] 4.7 Implement validation to return null/error for non-recipe content
  - [x] 4.8 Implement rate limiting integration for AI API calls using existing rate-limiter pattern
  - [x] 4.9 Add error handling for AI API failures, timeouts, and rate limits
  - [x] 4.10 Write unit tests in `lib/ai/recipe-extractor.test.ts` for successful extraction, non-recipe content, API failures, validation, and edge cases

- [ ] 5.0 Implement video audio transcription pipeline
  - [ ] 5.1 Create `lib/supabase/storage.ts` with utilities: uploadFile, downloadFile, deleteFile, generateSignedUrl
  - [ ] 5.2 Create `lib/ai/video-processor.ts` with functions: downloadVideo, extractAudio, getVideoDuration, cleanupFiles
  - [ ] 5.3 Implement video download function with file size validation (e.g., max 100MB) and store in Supabase Storage
  - [ ] 5.4 Implement audio extraction using ffmpeg to convert video to audio format (e.g., mp3 or wav) and upload to Supabase Storage
  - [ ] 5.5 Implement video duration check to enforce max duration limit (5 minutes per PRD)
  - [ ] 5.6 Create `lib/ai/audio-transcription.ts` with function `transcribeAudio(audioUrl: string): Promise<string>`
  - [ ] 5.7 Implement Whisper API integration (via Groq or OpenAI) for audio transcription
  - [ ] 5.8 Implement transcription caching based on video URL to avoid re-transcribing same content
  - [ ] 5.9 Implement graceful fallback for videos without audio or inaudible audio
  - [ ] 5.10 Implement cleanup function to delete temporary video/audio files from Supabase Storage after processing
  - [ ] 5.11 Write unit tests for video processing in `lib/ai/video-processor.test.ts`: download, extraction, duration check, cleanup
  - [ ] 5.12 Write unit tests for transcription in `lib/ai/audio-transcription.test.ts`: successful transcription, caching, failures, missing audio
  - [ ] 5.13 Write unit tests for storage utilities in `lib/supabase/storage.test.ts`: upload, download, delete, signed URLs

- [ ] 6.0 Integrate recipe extraction with scraper workflow
  - [ ] 6.1 Update `lib/scraper/database.ts` to add function `getScrapedContentById(id: number): Promise<ScrapedContent | null>`
  - [ ] 6.2 Add function `upsertRecipe(recipe: ExtractedRecipe): Promise<void>` to save extracted recipes to database
  - [ ] 6.3 Add function `getRecipeByScrapedContentId(scrapedContentId: number): Promise<ExtractedRecipe | null>` to check for existing recipes
  - [ ] 6.4 Modify scraper route handler in `app/api/scraper/route.ts` to trigger recipe extraction after successful scrape
  - [ ] 6.5 Implement extraction workflow: check if recipe exists, if not -> download video (if present) -> transcribe audio -> combine text + transcription -> call extractRecipe -> save to database
  - [ ] 6.6 Implement duplicate prevention by checking if recipe already exists for scraped content before extraction
  - [ ] 6.7 Add logging for extraction attempts (status, processing time, transcription status, errors) using existing error logging pattern
  - [ ] 6.8 Ensure extraction runs asynchronously and doesn't block scraper response
  - [ ] 6.9 Add error handling to prevent scraper failures if extraction fails
  - [ ] 6.10 Update scraper tests in `app/api/scraper/__tests__/route.test.ts` to verify extraction integration

- [ ] 7.0 Build recipe API endpoints for user interactions
  - [ ] 7.1 Create `app/api/recipes/route.ts` with GET handler to list all recipes (requires authentication per PRD)
  - [ ] 7.2 Create `app/api/recipes/[id]/route.ts` with GET handler to fetch single recipe by ID (requires authentication)
  - [ ] 7.3 Create `app/api/recipes/save/route.ts` with POST handler to save recipe to user's collection (authenticated, validate user owns the save action)
  - [ ] 7.4 Create `app/api/recipes/save/[recipeId]/route.ts` with DELETE handler to remove recipe from user's collection (authenticated, validate user owns the saved recipe)
  - [ ] 7.5 Create `app/api/recipes/[id]/edit/route.ts` with PUT handler to update user's custom recipe fields (authenticated, validate user owns the saved recipe)
  - [ ] 7.6 Create `app/api/recipes/my-collection/route.ts` with GET handler to retrieve user's saved recipes (authenticated)
  - [ ] 7.7 Implement request validation using Zod schemas for all endpoints
  - [ ] 7.8 Implement authentication checks using existing Supabase middleware patterns
  - [ ] 7.9 Implement user ownership validation for edit and delete operations
  - [ ] 7.10 Add proper HTTP status codes and error responses
  - [ ] 7.11 Write unit tests for all API endpoints covering success cases, authentication failures, validation errors, and not found scenarios

- [ ] 8.0 Create recipe UI components
  - [ ] 8.1 Create `components/recipe/recipe-card.tsx` to display recipe with title, ingredients list, instructions list, and source link
  - [ ] 8.2 Create `components/recipe/save-recipe-button.tsx` with save/unsave toggle functionality and authentication check
  - [ ] 8.3 Implement optimistic UI updates for save/unsave actions with loading states
  - [ ] 8.4 Create `components/recipe/recipe-editor.tsx` with form fields for editing title (text input), ingredients (dynamic list with add/remove), instructions (dynamic list with add/remove/reorder)
  - [ ] 8.5 Implement form validation in recipe-editor using react-hook-form and Zod schema
  - [ ] 8.6 Create `components/recipe/recipe-collection.tsx` to display user's saved recipes in a grid/list layout
  - [ ] 8.7 Add loading skeletons and empty states for recipe components
  - [ ] 8.8 Integrate Supabase auth context to check user authentication state in components
  - [ ] 8.9 Add error handling and user feedback using toast notifications (sonner)
  - [ ] 8.10 Ensure responsive design for all recipe components following existing Tailwind CSS patterns

- [ ] 9.0 Testing and validation
  - [ ] 9.1 Run all unit tests with `npm run test` and ensure all tests pass
  - [ ] 9.2 Test full extraction workflow end-to-end: scrape URL -> extract recipe -> save to database
  - [ ] 9.3 Test video transcription workflow with various video formats and durations
  - [ ] 9.4 Test edge cases: non-recipe content, videos without audio, missing fields, API failures
  - [ ] 9.5 Test recipe save/unsave functionality with authenticated users
  - [ ] 9.6 Test recipe editing functionality with validation and user ownership checks
  - [ ] 9.7 Test recipe collection retrieval for users with multiple saved recipes
  - [ ] 9.8 Verify file cleanup after processing (check Supabase Storage bucket)
  - [ ] 9.9 Verify duplicate prevention (try extracting same URL twice)
  - [ ] 9.10 Run `npm run lint` to ensure code passes Biome checks
  - [ ] 9.11 Run `npm run build --turbopack` to ensure production build succeeds
  - [ ] 9.12 Manually test UI components in browser for usability and responsiveness
