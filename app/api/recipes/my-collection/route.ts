import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, userRecipes } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRecipesList = await db
      .select({
        userRecipeId: userRecipes.id,
        recipeId: recipes.id,
        title: recipes.title,
        ingredients: recipes.ingredients,
        instructions: recipes.instructions,
        scrapedContentId: recipes.scrapedContentId,
        confidence: recipes.confidence,
        aiProvider: recipes.aiProvider,
        customTitle: userRecipes.customTitle,
        customIngredients: userRecipes.customIngredients,
        customInstructions: userRecipes.customInstructions,
        savedAt: userRecipes.savedAt,
        updatedAt: userRecipes.updatedAt,
      })
      .from(userRecipes)
      .innerJoin(recipes, eq(userRecipes.recipeId, recipes.id))
      .where(eq(userRecipes.userId, user.id));

    const formattedRecipes = userRecipesList.map((item) => ({
      userRecipeId: item.userRecipeId,
      recipeId: item.recipeId,
      title: item.customTitle || item.title,
      ingredients:
        (item.customIngredients as string[] | null) ||
        (item.ingredients as string[]),
      instructions:
        (item.customInstructions as string[] | null) ||
        (item.instructions as string[]),
      scrapedContentId: item.scrapedContentId,
      confidence: item.confidence,
      aiProvider: item.aiProvider,
      hasCustomizations: !!(
        item.customTitle ||
        item.customIngredients ||
        item.customInstructions
      ),
      savedAt: item.savedAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return NextResponse.json({ recipes: formattedRecipes }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch user recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch user recipes" },
      { status: 500 },
    );
  }
}
