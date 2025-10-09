# Recipe Extraction Feature Guide

## Overview
The AI Recipe Extractor automatically extracts recipes from Instagram and TikTok posts. When you scrape a social media URL, the system:
1. Scrapes the content
2. Downloads and transcribes video audio (if present)
3. Uses AI to extract recipe data
4. Saves the recipe to the database

## How to Use

### 1. Scrape Content with a Recipe
1. Go to the home page (`/`)
2. Enter an Instagram or TikTok URL that contains a recipe
3. Click "Scrape URL"
4. You'll see the scraped data displayed
5. **Important**: Recipe extraction happens in the background (asynchronous)

### 2. View Extracted Recipes
After scraping (wait 10-30 seconds for extraction):

**Option A: View All Recipes**
- Navigate to `/all-recipes` or click "All Recipes" in the navbar
- See all recipes extracted from any scraped content
- Click "Save Recipe" to add to your collection

**Option B: View Your Saved Recipes**
- Navigate to `/recipes` or click "My Recipes" in the navbar
- See only recipes you've saved

### 3. Monitor Extraction Progress
Check the **server console** for logs:
- ✅ Success: `Recipe extracted successfully: <id> (1234ms)`
- ❌ Failure: `Recipe extraction failed: <error>`

## Environment Variables Required

Add these to your `.env.local`:

```env
# AI Recipe Extraction
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key-for-whisper
AI_PROVIDER=groq
MAX_VIDEO_DURATION_SECONDS=300
SUPABASE_STORAGE_BUCKET=video-processing

# Supabase (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Supabase Setup

### 1. Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `video-processing`
3. Set as **private** bucket
4. Add RLS policy for authenticated uploads

### 2. Database Tables
Already migrated if you ran `npm run db:migrate`:
- `recipes` - Stores extracted recipes
- `user_recipes` - Junction table for user's saved recipes

## Troubleshooting

### "Nothing happens when I scrape"
✅ **This is normal!** Recipe extraction runs in the background:
1. Scrape completes immediately (~1-5 seconds)
2. Recipe extraction runs asynchronously (~10-30 seconds)
3. Check server console for extraction logs
4. Visit `/all-recipes` to see extracted recipes

### "No recipes showing on /all-recipes"
Possible causes:
1. **Not enough time**: Wait 10-30 seconds after scraping
2. **No recipe in content**: The AI determined the post doesn't contain a recipe
3. **API keys missing**: Check `GROQ_API_KEY` is set
4. **Check console logs**: Look for extraction errors

### "Recipe extraction failed"
Common errors:
- **Missing API key**: Set `GROQ_API_KEY` in `.env.local`
- **Non-recipe content**: Post doesn't contain ingredients/instructions
- **Rate limits**: Groq API rate limit exceeded
- **Video too long**: Max 5 minutes (300 seconds)

## API Endpoints

### Recipe Management
- `GET /api/recipes` - List all extracted recipes (auth required)
- `GET /api/recipes/[id]` - Get single recipe
- `POST /api/recipes/save` - Save recipe to collection
- `DELETE /api/recipes/save/[recipeId]` - Remove from collection
- `PUT /api/recipes/[id]/edit` - Edit saved recipe
- `GET /api/recipes/my-collection` - Get user's saved recipes

### Testing with cURL

```bash
# List all recipes
curl -X GET http://localhost:3000/api/recipes \
  -H "Cookie: <auth-cookie>"

# Save a recipe
curl -X POST http://localhost:3000/api/recipes/save \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{"recipeId": "uuid-here"}'
```

## Example Recipe Content

For testing, use social media posts that contain:
- **Title**: Clear recipe name
- **Ingredients**: List with quantities (e.g., "2 cups flour")
- **Instructions**: Step-by-step cooking directions

**Best results**: Posts with both text (captions) AND video with voiceover

## Feature Flow Diagram

```
User scrapes URL
  ↓
Scraper saves content to DB
  ↓
Returns scraped data immediately
  ↓
(Background) Recipe extraction starts
  ↓
Downloads video (if present)
  ↓
Extracts audio → Transcribes with Whisper
  ↓
Combines text + transcription
  ↓
AI extracts recipe (Groq LLM)
  ↓
Saves to recipes table
  ↓
User can view on /all-recipes
  ↓
User saves to their collection
  ↓
User can edit their saved copy
```

## Next Steps

1. ✅ Ensure environment variables are set
2. ✅ Create Supabase storage bucket
3. ✅ Scrape a URL with a recipe
4. ✅ Wait 10-30 seconds
5. ✅ Check `/all-recipes` to see extracted recipes
6. ✅ Save recipes to your collection
7. ✅ Edit and customize saved recipes
