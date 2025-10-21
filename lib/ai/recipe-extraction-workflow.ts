import { db } from "@/db";
import { userRecipes } from "@/db/schema";
import {
  getRecipeByScrapedContentId,
  upsertRecipe,
} from "@/lib/scraper/database";
import type { ScrapedContent } from "@/lib/scraper/types";
import { downloadFile } from "@/lib/supabase/storage";
import { transcribeAudio } from "./audio-transcription";
import { extractRecipe } from "./recipe-extractor";
import type { RecipeExtractionInput } from "./types";
import {
  cleanupFiles,
  downloadVideo,
  extractAudio,
  getVideoDuration,
  validateVideoDuration,
} from "./video-processor";

export interface RecipeExtractionWorkflowResult {
  success: boolean;
  recipeId: string | null;
  processingTimeMs: number;
  error: string | null;
  transcriptionStatus: "success" | "failed" | "skipped" | null;
}

export async function extractRecipeFromScrapedContent(
  scrapedContentData: ScrapedContent,
  scrapedContentId: number,
  userId?: string,
): Promise<RecipeExtractionWorkflowResult> {
  const startTime = Date.now();
  const filesToCleanup: string[] = [];

  try {
    const existingRecipe = await getRecipeByScrapedContentId(scrapedContentId);
    if (existingRecipe) {
      return {
        success: true,
        recipeId: existingRecipe.id,
        processingTimeMs: Date.now() - startTime,
        error: null,
        transcriptionStatus: null,
      };
    }

    let transcription: string | null = null;
    let transcriptionStatus: "success" | "failed" | "skipped" = "skipped";

    if (scrapedContentData.videoUrl) {
      try {
        const { path: videoPath, error: downloadError } = await downloadVideo(
          scrapedContentData.videoUrl,
        );

        if (downloadError || !videoPath) {
          console.error("Video download failed:", downloadError);
        } else {
          filesToCleanup.push(videoPath);

          const { data: videoBlob, error: videoBlobError } = await downloadFile(
            { path: videoPath },
          );

          if (!videoBlobError && videoBlob) {
            const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
            const { duration, error: durationError } =
              await getVideoDuration(videoBuffer);

            if (durationError) {
              console.error("Duration check failed:", durationError);
            } else {
              const durationValidation = validateVideoDuration(duration);

              if (durationValidation.valid) {
                const timestamp = Date.now();
                const audioPath = `temp/audio/${timestamp}/audio.mp3`;

                const { path: extractedAudioPath, error: extractError } =
                  await extractAudio(videoBuffer, audioPath);

                if (extractError || !extractedAudioPath) {
                  console.error("Audio extraction failed:", extractError);
                  transcriptionStatus = "failed";
                } else {
                  filesToCleanup.push(extractedAudioPath);

                  const cacheKey = `video-${scrapedContentData.url}`;
                  const {
                    transcription: transcriptionResult,
                    error: transcriptionError,
                  } = await transcribeAudio(extractedAudioPath, cacheKey);

                  if (transcriptionError) {
                    console.error("Transcription failed:", transcriptionError);
                    transcriptionStatus = "failed";
                  } else {
                    transcription = transcriptionResult;
                    transcriptionStatus = "success";
                  }
                }
              } else {
                console.warn(
                  "Video duration exceeds limit:",
                  durationValidation.error,
                );
                transcriptionStatus = "skipped";
              }
            }
          }
        }
      } catch (error) {
        console.error("Video processing error:", error);
        transcriptionStatus = "failed";
      }
    }

    const extractionInput: RecipeExtractionInput = {
      title: scrapedContentData.title,
      textContent: scrapedContentData.title,
      hashtags: scrapedContentData.hashtags,
      transcription,
      platform: scrapedContentData.platform,
    };

    const extractionResult = await extractRecipe(extractionInput);

    if (!extractionResult.success || !extractionResult.data) {
      await cleanupFiles(filesToCleanup);
      return {
        success: false,
        recipeId: null,
        processingTimeMs: Date.now() - startTime,
        error: extractionResult.error || "Recipe extraction failed",
        transcriptionStatus,
      };
    }

    const { id: recipeId, error: upsertError } = await upsertRecipe({
      title: extractionResult.data.title,
      ingredients: extractionResult.data.ingredients,
      instructions: extractionResult.data.instructions,
      scrapedContentId,
      confidence: extractionResult.data.confidence,
      aiProvider: extractionResult.data.aiProvider,
      transcription: extractionResult.transcription,
    });

    await cleanupFiles(filesToCleanup);

    if (upsertError) {
      return {
        success: false,
        recipeId: null,
        processingTimeMs: Date.now() - startTime,
        error: `Failed to save recipe: ${upsertError.message}`,
        transcriptionStatus,
      };
    }

    if (userId) {
      try {
        await db.insert(userRecipes).values({
          userId,
          recipeId,
        });
      } catch (error) {
        console.error("Failed to auto-save recipe to user:", error);
      }
    }

    return {
      success: true,
      recipeId,
      processingTimeMs: Date.now() - startTime,
      error: null,
      transcriptionStatus,
    };
  } catch (error) {
    await cleanupFiles(filesToCleanup);
    return {
      success: false,
      recipeId: null,
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      transcriptionStatus: "failed",
    };
  }
}
