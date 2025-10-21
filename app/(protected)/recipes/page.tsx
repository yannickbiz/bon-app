"use client";

import RecipeCollection from "@/components/recipe/recipe-collection";

export default function RecipesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Recipe Collection</h1>
        <p className="text-muted-foreground">
          Recipes you've saved from scraped social media content
        </p>
      </div>
      <RecipeCollection />
    </div>
  );
}
