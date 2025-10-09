import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { userRecipes } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

const saveRecipeSchema = z.object({
  recipeId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = saveRecipeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { recipeId } = validation.data;

    await db.insert(userRecipes).values({
      userId: user.id,
      recipeId,
    });

    return NextResponse.json(
      { message: "Recipe saved successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save recipe:", error);
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 },
    );
  }
}
