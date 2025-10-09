import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  ingredients: z
    .array(z.string().min(1))
    .min(1, "At least one ingredient is required"),
  instructions: z
    .array(z.string().min(1))
    .min(1, "At least one instruction is required"),
  isRecipe: z.boolean(),
});

export const recipeExtractionInputSchema = z.object({
  title: z.string().nullable(),
  textContent: z.string().nullable(),
  hashtags: z.array(z.string()),
  transcription: z.string().nullable(),
  platform: z.enum(["instagram", "tiktok"]),
});

export type RecipeSchemaType = z.infer<typeof recipeSchema>;
export type RecipeExtractionInputType = z.infer<
  typeof recipeExtractionInputSchema
>;
