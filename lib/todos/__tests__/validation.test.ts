import { describe, expect, it } from "vitest";
import { validateTodoText } from "../validation";

describe("validateTodoText", () => {
  describe("valid inputs", () => {
    it("should accept valid todo text", () => {
      const result = validateTodoText("Buy groceries");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept text with leading/trailing whitespace (trimmed)", () => {
      const result = validateTodoText("  Buy milk  ");
      expect(result.isValid).toBe(true);
    });

    it("should accept single character text", () => {
      const result = validateTodoText("a");
      expect(result.isValid).toBe(true);
    });

    it("should accept text at max length (500 characters)", () => {
      const maxText = "a".repeat(500);
      const result = validateTodoText(maxText);
      expect(result.isValid).toBe(true);
    });

    it("should accept text with special characters", () => {
      const result = validateTodoText("Call @John! #urgent");
      expect(result.isValid).toBe(true);
    });

    it("should accept text with emojis", () => {
      const result = validateTodoText("Complete task 🎯");
      expect(result.isValid).toBe(true);
    });
  });

  describe("invalid inputs - empty or whitespace", () => {
    it("should reject empty string", () => {
      const result = validateTodoText("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Todo text is required");
    });

    it("should reject whitespace-only string (spaces)", () => {
      const result = validateTodoText("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Todo text cannot be empty or whitespace only");
    });

    it("should reject whitespace-only string (tabs)", () => {
      const result = validateTodoText("\t\t\t");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Todo text cannot be empty or whitespace only");
    });

    it("should reject whitespace-only string (newlines)", () => {
      const result = validateTodoText("\n\n");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Todo text cannot be empty or whitespace only");
    });

    it("should reject mixed whitespace", () => {
      const result = validateTodoText(" \t\n ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Todo text cannot be empty or whitespace only");
    });
  });

  describe("invalid inputs - length violations", () => {
    it("should reject text exceeding 500 characters", () => {
      const tooLong = "a".repeat(501);
      const result = validateTodoText(tooLong);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Todo text must not exceed 500 characters");
    });

    it("should reject text with 1000 characters", () => {
      const wayTooLong = "a".repeat(1000);
      const result = validateTodoText(wayTooLong);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Todo text must not exceed 500 characters");
    });
  });

  describe("edge cases", () => {
    it("should accept text with exactly 499 characters", () => {
      const text = "a".repeat(499);
      const result = validateTodoText(text);
      expect(result.isValid).toBe(true);
    });

    it("should accept text with exactly 501 characters trimmed to 500", () => {
      // If we add whitespace that gets trimmed, original might be 501 but trimmed is less
      const text = " " + "a".repeat(499) + " ";
      const result = validateTodoText(text);
      expect(result.isValid).toBe(true);
    });

    it("should accept text with numbers", () => {
      const result = validateTodoText("Task 123");
      expect(result.isValid).toBe(true);
    });

    it("should accept text with punctuation", () => {
      const result = validateTodoText("Buy milk, eggs, and bread.");
      expect(result.isValid).toBe(true);
    });
  });
});
