export interface RecipeExtractionInput {
  title: string | null;
  textContent: string | null;
  hashtags: string[];
  transcription: string | null;
  platform: "instagram" | "tiktok";
}

export interface ExtractedRecipe {
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
  confidence: string | null;
  aiProvider: string | null;
  transcription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeExtractionResult {
  success: boolean;
  data: ExtractedRecipe | null;
  confidence: number | null;
  error: string | null;
  transcription: string | null;
}

export interface RecipeData {
  title: string;
  ingredients: string[];
  instructions: string[];
  isRecipe: boolean;
}
