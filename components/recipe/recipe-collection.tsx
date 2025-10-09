"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "./recipe-card";

interface Recipe {
  recipeId: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  scrapedContentId: number;
  confidence?: string | null;
  aiProvider?: string | null;
  hasCustomizations: boolean;
  savedAt: string;
}

export default function RecipeCollection() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipes = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/recipes/my-collection");

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      toast.error("Failed to load your recipe collection");
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No recipes saved yet</h3>
        <p className="text-muted-foreground">
          Start saving recipes from scraped content to build your collection!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <div key={recipe.recipeId} className="relative">
          <RecipeCard
            recipe={{
              id: recipe.recipeId,
              title: recipe.title,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              scrapedContentId: recipe.scrapedContentId,
              confidence: recipe.confidence,
              aiProvider: recipe.aiProvider,
            }}
          />
          {recipe.hasCustomizations && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              Customized
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
