import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";
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

    const allRecipes = await db.select().from(recipes);

    const formattedRecipes = allRecipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients as string[],
      instructions: recipe.instructions as string[],
      scrapedContentId: recipe.scrapedContentId,
      confidence: recipe.confidence,
      aiProvider: recipe.aiProvider,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
    }));

    return NextResponse.json({ recipes: formattedRecipes }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 },
    );
  }
}
