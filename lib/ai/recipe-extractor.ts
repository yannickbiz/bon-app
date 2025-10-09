import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { recipeSchema } from "./schemas";
import type { RecipeExtractionInput, RecipeExtractionResult } from "./types";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

function calculateConfidence(
  title: string,
  ingredients: string[],
  instructions: string[],
): number {
  let score = 0;

  if (title && title.length > 0) score += 0.2;
  if (ingredients.length >= 3) score += 0.4;
  else if (ingredients.length >= 1) score += 0.2;
  if (instructions.length >= 3) score += 0.4;
  else if (instructions.length >= 1) score += 0.2;

  return Math.min(score, 1.0);
}

export async function extractRecipe(
  input: RecipeExtractionInput,
): Promise<RecipeExtractionResult> {
  try {
    const combinedText = [
      input.title,
      input.textContent,
      input.hashtags.join(" "),
      input.transcription,
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!combinedText.trim()) {
      return {
        success: false,
        data: null,
        confidence: null,
        error: "No content available for extraction",
        transcription: input.transcription,
      };
    }

    const prompt = `You are a recipe extraction AI. Analyze the following social media content from ${input.platform} and determine if it contains a recipe.

Content:
${combinedText}

Instructions:
1. If this content contains a recipe, extract the title, ingredients (with quantities when available), and step-by-step cooking instructions.
2. If this is NOT a recipe (e.g., just food photos, restaurant reviews, general cooking tips), set isRecipe to false and return empty arrays.
3. Be strict: only extract if there are clear ingredients AND cooking instructions.
4. Format ingredients with quantities when available (e.g., "2 cups flour", "1 tbsp salt").
5. Make instructions clear and sequential.
6. Combine information from captions and transcription if both are available.`;

    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: recipeSchema,
      prompt,
    });

    if (!result.object.isRecipe) {
      return {
        success: false,
        data: null,
        confidence: null,
        error: "Content does not contain a recipe",
        transcription: input.transcription,
      };
    }

    if (
      !result.object.title ||
      result.object.ingredients.length === 0 ||
      result.object.instructions.length === 0
    ) {
      return {
        success: false,
        data: null,
        confidence: null,
        error: "Incomplete recipe data extracted",
        transcription: input.transcription,
      };
    }

    const confidence = calculateConfidence(
      result.object.title,
      result.object.ingredients,
      result.object.instructions,
    );

    return {
      success: true,
      data: {
        id: crypto.randomUUID(),
        title: result.object.title,
        ingredients: result.object.ingredients,
        instructions: result.object.instructions,
        scrapedContentId: 0,
        originalData: {
          title: result.object.title,
          ingredients: result.object.ingredients,
          instructions: result.object.instructions,
        },
        confidence: confidence.toFixed(4),
        aiProvider: "groq",
        transcription: input.transcription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      confidence,
      error: null,
      transcription: input.transcription,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      data: null,
      confidence: null,
      error: `AI extraction failed: ${errorMessage}`,
      transcription: input.transcription,
    };
  }
}
