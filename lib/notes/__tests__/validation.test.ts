import { describe, expect, it } from "vitest";
import { validateNoteContent, validateNoteTitle } from "../validation";

describe("validateNoteTitle", () => {
  describe("valid inputs", () => {
    it("should accept valid note title", () => {
      const result = validateNoteTitle("Meeting Notes");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept title with leading/trailing whitespace (trimmed)", () => {
      const result = validateNoteTitle("  Project Ideas  ");
      expect(result.isValid).toBe(true);
    });

    it("should accept single character title", () => {
      const result = validateNoteTitle("A");
      expect(result.isValid).toBe(true);
    });

    it("should accept title at max length (100 characters)", () => {
      const maxTitle = "a".repeat(100);
      const result = validateNoteTitle(maxTitle);
      expect(result.isValid).toBe(true);
    });

    it("should accept title with special characters", () => {
      const result = validateNoteTitle("Important! @Work #Q1-2024");
      expect(result.isValid).toBe(true);
    });

    it("should accept title with emojis", () => {
      const result = validateNoteTitle("Weekend Plans 🎉");
      expect(result.isValid).toBe(true);
    });

    it("should accept title with numbers", () => {
      const result = validateNoteTitle("2024 Goals");
      expect(result.isValid).toBe(true);
    });
  });

  describe("invalid inputs - empty or whitespace", () => {
    it("should reject empty string", () => {
      const result = validateNoteTitle("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Note title is required");
    });

    it("should reject whitespace-only string (spaces)", () => {
      const result = validateNoteTitle("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Note title cannot be empty or whitespace only",
      );
    });

    it("should reject whitespace-only string (tabs)", () => {
      const result = validateNoteTitle("\t\t\t");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Note title cannot be empty or whitespace only",
      );
    });

    it("should reject whitespace-only string (newlines)", () => {
      const result = validateNoteTitle("\n\n");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Note title cannot be empty or whitespace only",
      );
    });

    it("should reject mixed whitespace", () => {
      const result = validateNoteTitle(" \t\n ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Note title cannot be empty or whitespace only",
      );
    });
  });

  describe("invalid inputs - length violations", () => {
    it("should reject title exceeding 100 characters", () => {
      const tooLong = "a".repeat(101);
      const result = validateNoteTitle(tooLong);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Note title must not exceed 100 characters");
    });

    it("should reject title with 200 characters", () => {
      const wayTooLong = "a".repeat(200);
      const result = validateNoteTitle(wayTooLong);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Note title must not exceed 100 characters");
    });
  });

  describe("edge cases", () => {
    it("should accept title with exactly 99 characters", () => {
      const title = "a".repeat(99);
      const result = validateNoteTitle(title);
      expect(result.isValid).toBe(true);
    });

    it("should accept title with punctuation", () => {
      const result = validateNoteTitle("Books to Read: Fiction & Non-Fiction");
      expect(result.isValid).toBe(true);
    });
  });
});

describe("validateNoteContent", () => {
  describe("valid inputs", () => {
    it("should accept valid note content", () => {
      const result = validateNoteContent("This is my note content");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept empty string (content is optional)", () => {
      const result = validateNoteContent("");
      expect(result.isValid).toBe(true);
    });

    it("should accept content with markdown", () => {
      const markdown = "# Heading\n\n## Subheading\n\n- Item 1\n- Item 2";
      const result = validateNoteContent(markdown);
      expect(result.isValid).toBe(true);
    });

    it("should accept content with code blocks", () => {
      const content = "```javascript\nconst x = 10;\n```";
      const result = validateNoteContent(content);
      expect(result.isValid).toBe(true);
    });

    it("should accept content at max length (50,000 characters)", () => {
      const maxContent = "a".repeat(50000);
      const result = validateNoteContent(maxContent);
      expect(result.isValid).toBe(true);
    });

    it("should accept content with special characters", () => {
      const result = validateNoteContent("Special: @#$%^&*()!?");
      expect(result.isValid).toBe(true);
    });

    it("should accept content with emojis", () => {
      const result = validateNoteContent("Great idea! 🚀 Let's do it! 🎉");
      expect(result.isValid).toBe(true);
    });

    it("should accept multiline content", () => {
      const content = "Line 1\nLine 2\nLine 3\n\nParagraph 2";
      const result = validateNoteContent(content);
      expect(result.isValid).toBe(true);
    });
  });

  describe("invalid inputs - length violations", () => {
    it("should reject content exceeding 50,000 characters", () => {
      const tooLong = "a".repeat(50001);
      const result = validateNoteContent(tooLong);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Note content must not exceed 50000 characters",
      );
    });

    it("should reject content with 100,000 characters", () => {
      const wayTooLong = "a".repeat(100000);
      const result = validateNoteContent(wayTooLong);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Note content must not exceed 50000 characters",
      );
    });
  });

  describe("edge cases", () => {
    it("should accept content with exactly 49,999 characters", () => {
      const content = "a".repeat(49999);
      const result = validateNoteContent(content);
      expect(result.isValid).toBe(true);
    });

    it("should accept content with URLs", () => {
      const content = "Check out https://example.com for more info";
      const result = validateNoteContent(content);
      expect(result.isValid).toBe(true);
    });

    it("should accept content with HTML-like text", () => {
      const content = "<div>This is not actual HTML</div>";
      const result = validateNoteContent(content);
      expect(result.isValid).toBe(true);
    });
  });
});
