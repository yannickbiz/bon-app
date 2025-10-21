"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SaveRecipeButtonProps {
  recipeId: string;
  initialSaved?: boolean;
  onSaveChange?: (saved: boolean) => void;
}

export default function SaveRecipeButton({
  recipeId,
  initialSaved = false,
  onSaveChange,
}: SaveRecipeButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSave = async () => {
    setIsLoading(true);

    try {
      if (isSaved) {
        const response = await fetch(`/api/recipes/save/${recipeId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to remove recipe");
        }

        setIsSaved(false);
        toast.success("Recipe removed from your collection");
        onSaveChange?.(false);
      } else {
        const response = await fetch("/api/recipes/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save recipe");
        }

        setIsSaved(true);
        toast.success("Recipe saved to your collection");
        onSaveChange?.(true);
      }
    } catch (error) {
      console.error("Failed to toggle recipe save:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update recipe",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleSave}
      disabled={isLoading}
      variant={isSaved ? "default" : "outline"}
    >
      {isLoading ? "Loading..." : isSaved ? "Saved" : "Save Recipe"}
    </Button>
  );
}
