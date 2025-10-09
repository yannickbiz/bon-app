import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const recipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id))
      .limit(1);

    if (recipe.length === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const formattedRecipe = {
      id: recipe[0].id,
      title: recipe[0].title,
      ingredients: recipe[0].ingredients as string[],
      instructions: recipe[0].instructions as string[],
      scrapedContentId: recipe[0].scrapedContentId,
      originalData: recipe[0].originalData as {
        title: string;
        ingredients: string[];
        instructions: string[];
      },
      confidence: recipe[0].confidence,
      aiProvider: recipe[0].aiProvider,
      transcription: recipe[0].transcription,
      createdAt: recipe[0].createdAt.toISOString(),
      updatedAt: recipe[0].updatedAt.toISOString(),
    };

    return NextResponse.json({ recipe: formattedRecipe }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 },
    );
  }
}
