"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import RecipeCard from "@/components/recipe/recipe-card";
import SaveRecipeButton from "@/components/recipe/save-recipe-button";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  scrapedContentId: number;
  confidence?: string | null;
  aiProvider?: string | null;
  createdAt: string;
}

export default function AllRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipes = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/recipes");

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      toast.error("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchRecipes is a stable function
  useEffect(() => {
    fetchRecipes();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Extracted Recipes</h1>
          <p className="text-muted-foreground">
            Browse all recipes automatically extracted from scraped content
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton loading placeholders
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Extracted Recipes</h1>
          <p className="text-muted-foreground">
            Browse all recipes automatically extracted from scraped content
          </p>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground">
            Scrape some social media posts with recipes to see them here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Extracted Recipes</h1>
        <p className="text-muted-foreground mb-4">
          Browse all recipes automatically extracted from scraped content (
          {recipes.length} total)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="space-y-2">
            <RecipeCard recipe={recipe} />
            <SaveRecipeButton recipeId={recipe.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
