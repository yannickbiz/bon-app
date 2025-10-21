"use client";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import RecipeEditor from "@/components/recipe/recipe-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  scrapedContentId: number;
  confidence?: string | null;
  aiProvider?: string | null;
  transcription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [recipeId, setRecipeId] = useState<string>("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => setRecipeId(p.id));
  }, [params]);

  useEffect(() => {
    if (!recipeId) return;

    async function fetchRecipe() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/recipes/${recipeId}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Recipe not found");
            router.push("/recipes");
            return;
          }
          throw new Error("Failed to fetch recipe");
        }

        const data = await response.json();
        setRecipe(data.recipe);
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
        toast.error("Failed to load recipe");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecipe();
  }, [recipeId, router]);

  const handleEditComplete = async () => {
    setIsEditing(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data.recipe);
      }
    } catch (error) {
      console.error("Failed to refresh recipe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipeId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recipes/save/${recipeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }

      toast.success("Recipe removed from your collection");
      router.push("/recipes");
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      toast.error("Failed to remove recipe");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Recipe not found</h3>
          <p className="text-muted-foreground mb-4">
            The recipe you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/recipes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Recipes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(false)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <RecipeEditor
          recipeId={recipe.id}
          initialTitle={recipe.title}
          initialIngredients={recipe.ingredients}
          initialInstructions={recipe.instructions}
          onSave={handleEditComplete}
        />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/recipes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Recipes
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{recipe.title}</CardTitle>
            {recipe.confidence && (
              <p className="text-sm text-muted-foreground">
                Confidence:{" "}
                {(Number.parseFloat(recipe.confidence) * 100).toFixed(0)}%
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={`ingredient-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: ingredients are static strings
                      index
                    }`}
                    className="flex items-start"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold mb-3">Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li
                    key={`instruction-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: instructions are static strings
                      index
                    }`}
                    className="flex items-start"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold mr-3 flex-shrink-0 text-sm">
                      {index + 1}
                    </span>
                    <span className="pt-1">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {recipe.transcription && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Video Transcription
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {recipe.transcription}
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Source: Scraped Content #{recipe.scrapedContentId}</p>
              {recipe.aiProvider && <p>Extracted by: {recipe.aiProvider}</p>}
              <p>
                Created:{" "}
                {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {recipe.updatedAt !== recipe.createdAt && (
                <p>
                  Last updated:{" "}
                  {new Date(recipe.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this recipe from your collection?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
