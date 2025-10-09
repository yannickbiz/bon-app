import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { userRecipes } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

const editRecipeSchema = z.object({
  customTitle: z.string().min(1).optional(),
  customIngredients: z.array(z.string().min(1)).optional(),
  customInstructions: z.array(z.string().min(1)).optional(),
});

export async function PUT(
  request: Request,
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

    const { id: recipeId } = await params;
    const body = await request.json();
    const validation = editRecipeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.issues },
        { status: 400 },
      );
    }

    const existingUserRecipe = await db
      .select()
      .from(userRecipes)
      .where(
        and(
          eq(userRecipes.userId, user.id),
          eq(userRecipes.recipeId, recipeId),
        ),
      )
      .limit(1);

    if (existingUserRecipe.length === 0) {
      return NextResponse.json(
        { error: "Recipe not found in user collection" },
        { status: 404 },
      );
    }

    await db
      .update(userRecipes)
      .set({
        customTitle: validation.data.customTitle,
        customIngredients: validation.data.customIngredients,
        customInstructions: validation.data.customInstructions,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userRecipes.userId, user.id),
          eq(userRecipes.recipeId, recipeId),
        ),
      );

    return NextResponse.json(
      { message: "Recipe updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 },
    );
  }
}
