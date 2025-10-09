import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractRecipe } from "./recipe-extractor";
import type { RecipeExtractionInput } from "./types";

vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

vi.mock("@ai-sdk/groq", () => ({
  createGroq: vi.fn(() => vi.fn()),
}));

import { generateObject } from "ai";

describe("extractRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract recipe successfully from valid content", async () => {
    const mockRecipe = {
      title: "Chocolate Chip Cookies",
      ingredients: ["2 cups flour", "1 cup sugar", "1 cup chocolate chips"],
      instructions: [
        "Mix dry ingredients",
        "Add wet ingredients",
        "Bake at 350F for 12 minutes",
      ],
      isRecipe: true,
    };

    vi.mocked(generateObject).mockResolvedValue({
      object: mockRecipe,
    } as any);

    const input: RecipeExtractionInput = {
      title: "Best Chocolate Chip Cookies!",
      textContent: "Here's my favorite recipe...",
      hashtags: ["baking", "cookies"],
      transcription: null,
      platform: "instagram",
    };

    const result = await extractRecipe(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe("Chocolate Chip Cookies");
    expect(result.data?.ingredients).toHaveLength(3);
    expect(result.data?.instructions).toHaveLength(3);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.error).toBeNull();
  });

  it("should return error for non-recipe content", async () => {
    const mockNonRecipe = {
      title: "",
      ingredients: [],
      instructions: [],
      isRecipe: false,
    };

    vi.mocked(generateObject).mockResolvedValue({
      object: mockNonRecipe,
    } as any);

    const input: RecipeExtractionInput = {
      title: "Check out this restaurant!",
      textContent: "Had a great meal at this place",
      hashtags: ["foodie", "restaurant"],
      transcription: null,
      platform: "tiktok",
    };

    const result = await extractRecipe(input);

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBe("Content does not contain a recipe");
  });

  it("should return error for empty content", async () => {
    const input: RecipeExtractionInput = {
      title: null,
      textContent: null,
      hashtags: [],
      transcription: null,
      platform: "instagram",
    };

    const result = await extractRecipe(input);

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBe("No content available for extraction");
  });

  it("should handle API failures gracefully", async () => {
    vi.mocked(generateObject).mockRejectedValue(
      new Error("API rate limit exceeded"),
    );

    const input: RecipeExtractionInput = {
      title: "Recipe Title",
      textContent: "Some recipe content",
      hashtags: ["cooking"],
      transcription: null,
      platform: "instagram",
    };

    const result = await extractRecipe(input);

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toContain("AI extraction failed");
    expect(result.error).toContain("API rate limit exceeded");
  });

  it("should return error for incomplete recipe data", async () => {
    const mockIncompleteRecipe = {
      title: "Pasta",
      ingredients: [],
      instructions: ["Cook pasta"],
      isRecipe: true,
    };

    vi.mocked(generateObject).mockResolvedValue({
      object: mockIncompleteRecipe,
    } as any);

    const input: RecipeExtractionInput = {
      title: "Quick Pasta",
      textContent: "Cook some pasta",
      hashtags: ["pasta"],
      transcription: null,
      platform: "tiktok",
    };

    const result = await extractRecipe(input);

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBe("Incomplete recipe data extracted");
  });

  it("should combine text content and transcription", async () => {
    const mockRecipe = {
      title: "Smoothie Bowl",
      ingredients: ["1 banana", "1 cup berries", "1/2 cup yogurt"],
      instructions: ["Blend all ingredients", "Pour into bowl", "Add toppings"],
      isRecipe: true,
    };

    vi.mocked(generateObject).mockResolvedValue({
      object: mockRecipe,
    } as any);

    const input: RecipeExtractionInput = {
      title: "Smoothie Bowl",
      textContent: "Ingredients in caption",
      hashtags: ["healthy"],
      transcription: "Blend everything together and enjoy!",
      platform: "instagram",
    };

    const result = await extractRecipe(input);

    expect(result.success).toBe(true);
    expect(result.transcription).toBe("Blend everything together and enjoy!");
    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("Blend everything together"),
      }),
    );
  });

  it("should calculate confidence score correctly", async () => {
    const mockRecipe = {
      title: "Test Recipe",
      ingredients: ["ingredient 1"],
      instructions: ["step 1", "step 2"],
      isRecipe: true,
    };

    vi.mocked(generateObject).mockResolvedValue({
      object: mockRecipe,
    } as any);

    const input: RecipeExtractionInput = {
      title: "Test",
      textContent: "Content",
      hashtags: [],
      transcription: null,
      platform: "instagram",
    };

    const result = await extractRecipe(input);

    expect(result.success).toBe(true);
    expect(result.confidence).toBeLessThan(1.0);
  });
});
