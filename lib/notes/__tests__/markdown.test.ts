import { describe, expect, it } from "vitest";
import { sanitizeMarkdown } from "../markdown";

describe("sanitizeMarkdown", () => {
  describe("XSS prevention", () => {
    it("should remove script tags", () => {
      const malicious = "Hello <script>alert('XSS')</script> world";
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("alert");
      expect(result).toBe("Hello  world");
    });

    it("should remove script tags case-insensitively", () => {
      const malicious = "Hello <SCRIPT>alert('XSS')</SCRIPT> world";
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toContain("<SCRIPT>");
      expect(result).toBe("Hello  world");
    });

    it("should remove iframe tags", () => {
      const malicious = '<iframe src="http://evil.com"></iframe>';
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toContain("<iframe>");
      expect(result).toBe("");
    });

    it("should remove multiple dangerous tags", () => {
      const malicious =
        '<script>alert("XSS")</script><iframe src="evil.com"></iframe>';
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("<iframe>");
      expect(result).toBe("");
    });

    it("should remove self-closing dangerous tags", () => {
      const malicious = '<input type="text" /><button />';
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toContain("<input");
      expect(result).not.toContain("<button");
    });

    it("should remove javascript: protocol", () => {
      const malicious = "<a href=\"javascript:alert('XSS')\">Click me</a>";
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toContain("javascript:");
      expect(result).toContain("<a href=\"alert('XSS')\">Click me</a>");
    });

    it("should remove javascript: protocol case-insensitively", () => {
      const malicious = "<a href=\"JaVaScRiPt:alert('XSS')\">Click me</a>";
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toMatch(/javascript:/i);
    });

    it("should remove onclick event handlers", () => {
      const malicious = "<div onclick=\"alert('XSS')\">Click me</div>";
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toContain("onclick");
      expect(result).toContain("Click me");
    });

    it("should remove various event handlers", () => {
      const malicious =
        '<div onload="bad()" onmouseover="bad()" onerror="bad()">Test</div>';
      const result = sanitizeMarkdown(malicious);
      expect(result).not.toContain("onload");
      expect(result).not.toContain("onmouseover");
      expect(result).not.toContain("onerror");
    });
  });

  describe("safe content", () => {
    it("should preserve safe markdown", () => {
      const safe = "# Heading\n\nSome **bold** text";
      const result = sanitizeMarkdown(safe);
      expect(result).toBe(safe);
    });

    it("should preserve safe HTML", () => {
      const safe = "<p>Hello <strong>world</strong></p>";
      const result = sanitizeMarkdown(safe);
      expect(result).toBe(safe);
    });

    it("should preserve links with safe protocols", () => {
      const safe = '<a href="https://example.com">Safe link</a>';
      const result = sanitizeMarkdown(safe);
      expect(result).toBe(safe);
    });

    it("should preserve code blocks", () => {
      const safe = "```javascript\nconst x = 10;\n```";
      const result = sanitizeMarkdown(safe);
      expect(result).toBe(safe);
    });

    it("should preserve inline code", () => {
      const safe = "Use `const` instead of `var`";
      const result = sanitizeMarkdown(safe);
      expect(result).toBe(safe);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = sanitizeMarkdown("");
      expect(result).toBe("");
    });

    it("should handle string with only safe content", () => {
      const safe = "Just plain text";
      const result = sanitizeMarkdown(safe);
      expect(result).toBe(safe);
    });

    it("should handle mixed safe and unsafe content", () => {
      const mixed =
        "# Title\n\n<script>bad()</script>\n\nSafe paragraph\n\n<iframe src='evil'></iframe>";
      const result = sanitizeMarkdown(mixed);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("<iframe>");
      expect(result).toContain("# Title");
      expect(result).toContain("Safe paragraph");
    });
  });
});
