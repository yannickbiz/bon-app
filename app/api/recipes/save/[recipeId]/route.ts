import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userRecipes } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = await params;

    await db
      .delete(userRecipes)
      .where(
        and(
          eq(userRecipes.userId, user.id),
          eq(userRecipes.recipeId, recipeId),
        ),
      );

    return NextResponse.json(
      { message: "Recipe removed from collection" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to remove recipe:", error);
    return NextResponse.json(
      { error: "Failed to remove recipe" },
      { status: 500 },
    );
  }
}
