# PRD: AI Recipe Extractor Agent

## Introduction/Overview

The AI Recipe Extractor Agent is a feature that automatically processes scraped social media content (Instagram and TikTok) to identify and extract structured recipe data. Many social media posts contain recipes but in unstructured formats (captions, videos with text overlays, voiceovers, descriptions). This feature solves the problem of having to manually parse through social media posts to find recipe information and standardizes recipe data across different platforms into a consistent, machine-readable format.

The goal is to automatically extract basic recipe components (title, ingredients, and instructions) from newly scraped content, including video audio transcription for recipe instructions, making it easier to build a searchable, structured recipe database. Users will be able to associate extracted recipes with their accounts and edit them to correct any extraction errors or add personal modifications.

## Goals

1. Automatically extract recipe data from newly scraped Instagram and TikTok content
2. Automatically save successfully extracted recipes to the database
3. Transcribe and analyze video audio to extract recipe instructions from voiceovers
4. Provide structured recipe output with title, ingredients, and cooking instructions
5. Allow users to save extracted recipes to their personal collections for future reference
6. Enable users to edit and modify extracted recipes to fix errors or add personal touches
7. Support multiple AI providers with Groq as the initial implementation
8. Return high-confidence extraction results or null for non-recipe content
9. Achieve high extraction accuracy (target: 85%+ correct extractions)

## User Stories

1. As a system, I want to automatically detect if scraped social media content contains a recipe so that I can process it without manual intervention.

2. As a developer, I want the recipe extractor to return structured data (title, ingredients, instructions) so that I can easily store and query recipes.

3. As a system administrator, I want to support multiple AI providers so that I can switch providers based on cost, performance, or availability.

4. As a developer, I want the extractor to return null or error when content doesn't contain a recipe so that I don't store incomplete or incorrect data.

5. As a system, I want to transcribe audio from recipe videos so that I can extract cooking instructions from voiceovers and spoken content.

6. As a system, I want to automatically save successfully extracted recipes to the database so that they are available for all users to discover and save.

7. As a user, I want to save extracted recipes to my personal collection so that I can access them later and build my recipe library.

8. As a user, I want to edit saved recipes so that I can fix any AI extraction errors or customize recipes to my preferences.

9. As a user, I want to see the original social media post associated with a recipe so that I can reference the source or watch the original video.

10. As a data analyst, I want to track extraction accuracy so that I can monitor and improve the system over time.

## Functional Requirements

1. The system must automatically trigger recipe extraction after successfully scraping Instagram or TikTok content.

2. The system must download and transcribe video audio when a video URL is present in the scraped content.

3. The system must use an audio transcription service (e.g., Whisper API via Groq or OpenAI) to convert video audio to text.

4. The system must send the scraped content (title, hashtags, text data, and transcribed audio) to an AI provider for analysis.

5. The system must support configurable AI providers, with Groq as the initial implementation.

6. The system must extract the following recipe components:
   - Recipe title
   - List of ingredients (with quantities when available)
   - Step-by-step cooking instructions

7. The system must combine text-based content and transcribed audio to provide comprehensive extraction (e.g., ingredients in caption + instructions in audio).

8. The system must return structured data in a consistent format regardless of the AI provider used.

9. The system must handle cases where content does not contain a recipe by returning null or an error response.

10. The system must include confidence scores with partial extraction results when recipe data is incomplete or ambiguous.

11. The system must handle videos without audio or inaudible audio gracefully by falling back to text-only extraction.

12. The system must only process newly scraped content, not existing database records.

13. The system must log extraction attempts including success/failure status, processing time, transcription status, and any errors.

14. The system must handle AI provider rate limits and API errors gracefully.

15. The system must validate that extracted data is not empty before returning success.

16. The system must support async/await patterns since AI API calls and audio processing are asynchronous operations.

17. The system must clean up temporary audio files after transcription to prevent storage bloat.

18. The system must automatically save successfully extracted recipes to the `recipes` table in the database.

19. The system must create a unique recipe record for each successful extraction, linked to the source scraped content.

20. The system must allow authenticated users to save/unsave extracted recipes to their personal collection.

21. The system must provide API endpoints for users to edit recipe fields (title, ingredients, instructions) in their personal copies.

22. The system must validate edited recipe data to ensure it maintains proper structure (non-empty fields, valid data types).

23. The system must preserve the original extracted recipe data separately from user edits for reference and quality tracking.

24. The system must track the relationship between extracted recipes and their source scraped content (foreign key relationship).

25. The system must allow multiple users to save the same extracted recipe independently (many-to-many relationship between users and recipes).

26. The system must prevent duplicate recipe creation for the same scraped content (check if recipe already exists before creating new one).

## Non-Goals (Out of Scope)

1. Extracting advanced recipe metadata (prep time, cook time, servings, cuisine type, dietary tags, nutritional information)
2. Processing or re-extracting recipes from existing scraped content in the database
3. User-triggered manual recipe extraction
4. Batch processing of multiple URLs at once
5. Visual analysis of video frames or images for recipe extraction (only audio and text-based extraction)
6. Translation of recipes from other languages
7. Recipe recommendation or search features
8. Social features (sharing recipes, commenting, rating)
9. Recipe version history or change tracking
10. Collaborative editing of recipes

## Design Considerations

### Data Structure

The recipe extractor should return data in the following TypeScript structure:

```typescript
interface RecipeExtractionResult {
  success: boolean;
  data: ExtractedRecipe | null;
  confidence: number | null;
  error: string | null;
  transcription: string | null;
}

interface ExtractedRecipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  scrapedContentId: number;
  originalData: {
    title: string;
    ingredients: string[];
    instructions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface UserRecipe {
  id: string;
  userId: string;
  recipeId: string;
  customTitle: string | null;
  customIngredients: string[] | null;
  customInstructions: string[] | null;
  savedAt: string;
  updatedAt: string;
}
```

### User Interface

The feature requires the following UI components:

1. **Recipe Display**: Show extracted recipe with title, ingredients, and instructions
2. **Save Button**: Allow authenticated users to save recipes to their collection
3. **Edit Mode**: Provide an interface for users to edit saved recipes with form fields for:
   - Recipe title (text input)
   - Ingredients (list with add/remove functionality)
   - Instructions (list with add/remove/reorder functionality)
4. **Recipe Collection View**: Display user's saved recipes in a list or grid
5. **Source Link**: Show link to original social media post
6. **Save Indicator**: Visual feedback showing whether a recipe is saved to user's collection

### Integration Points

- Integrates with existing scraper system (`lib/scraper/`)
- Should be called after successful scrape operations
- Requires authentication integration with existing Supabase auth system
- API routes for:
  - `GET /api/recipes` - List all extracted recipes (public or requires auth)
  - `GET /api/recipes/:id` - Get a specific recipe
  - `POST /api/recipes/save` - Save a recipe to user's collection (authenticated)
  - `DELETE /api/recipes/save/:recipeId` - Remove a recipe from user's collection (authenticated)
  - `PUT /api/recipes/:id/edit` - Update a user's custom recipe fields (authenticated)
  - `GET /api/recipes/my-collection` - Retrieve user's saved recipes (authenticated)
- May need updates to `ScrapedContent` type or database schema to store extracted recipes

## Technical Considerations

1. **AI Provider Abstraction**: Use Vercel AI SDK (`ai` package) for unified interface to support multiple AI providers (Groq initially, but extensible to OpenAI, Anthropic, etc.). The AI SDK provides:
   - Consistent API across different providers
   - Built-in streaming support
   - Structured output with `streamObject` or `generateObject` for type-safe recipe extraction
   - Easy provider switching via configuration

2. **Environment Configuration**: API keys and provider settings should be stored in environment variables

3. **Rate Limiting**: Consider integration with existing rate limiter (`lib/scraper/rate-limiter.ts`) or create a separate rate limiter for AI API calls

4. **Database Schema**: 
   - Create `recipes` table to store all extracted recipes with foreign key to `scraped_content`
   - Add unique constraint on `scraped_content_id` to prevent duplicate recipe extraction
   - Create `user_recipes` junction table for many-to-many relationship between users and recipes
   - Store original extraction data in `recipes` table
   - Store user customizations in `user_recipes` table (custom fields are nullable)
   - Consider using JSONB columns for flexible recipe data storage (ingredients, instructions)

5. **Error Handling**: Should follow existing error handling patterns in the scraper modules

6. **Audio Processing**: 
   - Download video files and store temporarily in Supabase Storage
   - Use Supabase Storage buckets (e.g., `video-processing`) for temporary file storage
   - Use ffmpeg or similar tool for audio extraction from video
   - Store extracted audio files in Supabase Storage before transcription
   - Handle various video formats (MP4, WebM, etc.)
   - Implement file size limits to prevent excessive processing costs
   - Clean up temporary files from Supabase Storage after processing completes
   - Consider using signed URLs with expiration for secure file access

7. **Transcription Service**: 
   - Groq supports Whisper models for audio transcription
   - Use audio files from Supabase Storage as input to transcription service
   - Consider transcription costs and implement limits (e.g., max audio duration of 5 minutes)
   - Handle transcription failures gracefully
   - Store transcription text in database for caching and future reference

8. **Authentication**: 
   - All recipe save/edit operations must require authenticated user
   - Use existing Supabase auth middleware for route protection
   - Validate user ownership before allowing recipe edits

9. **Testing**: Should include unit tests for:
   - Recipe extraction logic
   - Audio transcription workflow
   - AI provider interface
   - Data validation
   - Error cases (non-recipe content, API failures, transcription failures)
   - Recipe save/unsave functionality
   - Recipe editing with user permissions
   - User recipe collection retrieval

10. **Dependencies**: Will need to add:
   - Vercel AI SDK (`ai` package) for unified AI provider interface
   - Provider-specific packages (e.g., `@ai-sdk/groq` for Groq integration)
   - Audio processing library (e.g., ffmpeg or fluent-ffmpeg)
   - HTTP client for downloading videos (fetch API or axios)
   - Form validation library for recipe editing (zod - already used in the codebase)
   - Supabase Storage client (already available via existing Supabase integration)

11. **Prompt Engineering**: The AI prompt design is critical for extraction accuracy and should be well-documented and version-controlled. Use Vercel AI SDK's structured output features (zod schemas) to ensure consistent recipe format.

12. **Storage Management**:
   - Create Supabase Storage bucket for video/audio processing with appropriate access policies
   - Implement automatic cleanup of files older than X hours/days
   - Set file size limits at the bucket level
   - Use organized folder structure (e.g., `temp/videos/{timestamp}/`, `temp/audio/{timestamp}/`)

## Success Metrics

1. **Extraction Accuracy**: ≥85% of recipe extractions correctly identify title, ingredients, and instructions
   - Measured by manual review of random sample (e.g., 50-100 extractions)
   - Track false positives (non-recipes extracted as recipes)
   - Track false negatives (recipes not detected)

2. **Processing Reliability**: ≥95% uptime/availability for recipe extraction service
   - Track API failures, timeouts, and rate limit errors

3. **Response Time**: Average extraction time <15 seconds per post (including audio transcription)

4. **Data Completeness**: ≥90% of successful extractions contain all three components (title, ingredients, instructions)

5. **Transcription Success Rate**: ≥90% of videos with audio successfully transcribed

6. **Audio Enhancement**: Track improvement in extraction accuracy for video content with audio vs. text-only content

7. **User Engagement**:
   - Recipe save rate: % of automatically extracted recipes that are saved by at least one user
   - Edit rate: % of saved recipes that are edited by users
   - Average time to edit: Track how long after saving users edit recipes
   - Total recipes extracted: Count of all recipes automatically saved to database

8. **Data Quality**:
   - Track which fields are most commonly edited (title, ingredients, or instructions)
   - Use edit patterns to improve AI extraction prompts over time

## Open Questions

1. Should all automatically extracted recipes be publicly viewable, or should they only be visible to authenticated users? Only auth users.

2. What confidence score threshold should we use to determine if an extraction is successful enough to store? E.g., only store if confidence > 0.7?

3. Should we retry failed extractions with a different AI provider if the primary provider fails? Not for now.

4. Do we need to handle multi-language recipes, or can we assume all content is in English? For now, assume English only.

5. Should we track which AI provider was used for each extraction for analysis and comparison purposes? Yes.

6. What logging level is appropriate for extraction operations (info, debug, error only)? Error for now.

7. Should the system send any notifications or alerts when extraction accuracy drops below acceptable thresholds? Not for now.

8. What is the maximum video duration we should support for audio transcription? Should we skip transcription for very long videos? E.g., max 5 minutes.

9. Should we store the audio transcription separately in the database for debugging or future re-processing? Yes.

10. How should we handle videos that require authentication or have geographic restrictions? Skip these videos.

11. Should we implement caching for transcriptions to avoid re-transcribing the same video if re-processed? Yes, cache transcriptions based on video URL or video id? Decide what is best.

12. Should user edits to recipes be visible to other users who save the same recipe, or should each user have their own independent copy? Independent copy.

13. What happens to user-saved recipes if the original scraped content is deleted? The recipe remains in the user's collection.

14. Should we limit the number of recipes a user can save? Not for now.

15. Should we implement recipe search functionality within a user's collection? Not for now.

16. How should we handle concurrent edits by the same user from different devices? Last write wins for now.
