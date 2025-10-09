"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    scrapedContentId: number;
    confidence?: string | null;
    aiProvider?: string | null;
  };
  showSourceLink?: boolean;
}

export default function RecipeCard({
  recipe,
  showSourceLink = true,
}: RecipeCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        {recipe.confidence && (
          <p className="text-sm text-muted-foreground">
            Confidence:{" "}
            {(Number.parseFloat(recipe.confidence) * 100).toFixed(0)}%
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <ul className="list-disc list-inside space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-sm">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="text-sm">
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        {showSourceLink && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <p>Source: Scraped Content #{recipe.scrapedContentId}</p>
              {recipe.aiProvider && (
                <p className="mt-1">Extracted by: {recipe.aiProvider}</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
