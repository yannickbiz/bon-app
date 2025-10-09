"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const recipeEditSchema = z.object({
  customTitle: z.string().min(1, "Title must not be empty"),
  customIngredients: z
    .array(z.string().min(1, "Ingredient must not be empty"))
    .min(1, "At least one ingredient is required"),
  customInstructions: z
    .array(z.string().min(1, "Instruction must not be empty"))
    .min(1, "At least one instruction is required"),
});

type RecipeEditFormData = z.infer<typeof recipeEditSchema>;

interface RecipeEditorProps {
  recipeId: string;
  initialTitle: string;
  initialIngredients: string[];
  initialInstructions: string[];
  onSave?: () => void;
  onCancel?: () => void;
}

export default function RecipeEditor({
  recipeId,
  initialTitle,
  initialIngredients,
  initialInstructions,
  onSave,
  onCancel,
}: RecipeEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecipeEditFormData>({
    defaultValues: {
      customTitle: initialTitle,
      customIngredients: initialIngredients,
      customInstructions: initialInstructions,
    },
  });

  const onSubmit = async (data: RecipeEditFormData) => {
    const validation = recipeEditSchema.safeParse(data);

    if (!validation.success) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/recipes/${recipeId}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update recipe");
      }

      toast.success("Recipe updated successfully");
      onSave?.();
    } catch (error) {
      console.error("Failed to update recipe:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update recipe",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    const current = form.getValues("customIngredients");
    form.setValue("customIngredients", [...current, ""]);
  };

  const removeIngredient = (index: number) => {
    const current = form.getValues("customIngredients");
    form.setValue(
      "customIngredients",
      current.filter((_, i) => i !== index),
    );
  };

  const addInstruction = () => {
    const current = form.getValues("customInstructions");
    form.setValue("customInstructions", [...current, ""]);
  };

  const removeInstruction = (index: number) => {
    const current = form.getValues("customInstructions");
    form.setValue(
      "customInstructions",
      current.filter((_, i) => i !== index),
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipe Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter recipe title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Ingredients</FormLabel>
            <Button
              type="button"
              onClick={addIngredient}
              variant="outline"
              size="sm"
            >
              Add Ingredient
            </Button>
          </div>
          {form.watch("customIngredients").map((_, index) => (
            <div key={index} className="flex gap-2">
              <FormField
                control={form.control}
                name={`customIngredients.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`Ingredient ${index + 1}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={() => removeIngredient(index)}
                variant="destructive"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Instructions</FormLabel>
            <Button
              type="button"
              onClick={addInstruction}
              variant="outline"
              size="sm"
            >
              Add Instruction
            </Button>
          </div>
          {form.watch("customInstructions").map((_, index) => (
            <div key={index} className="flex gap-2">
              <FormField
                control={form.control}
                name={`customInstructions.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder={`Step ${index + 1}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={() => removeInstruction(index)}
                variant="destructive"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
