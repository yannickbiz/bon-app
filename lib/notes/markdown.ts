/**
 * Sanitize markdown content to prevent XSS attacks
 * This is a basic implementation - in production, consider using a library like DOMPurify
 */
export function sanitizeMarkdown(content: string): string {
  // Remove potentially dangerous HTML tags
  const dangerousTags = [
    "script",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "button",
  ];

  let sanitized = content;

  // Remove dangerous tags (case-insensitive)
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, "gis");
    sanitized = sanitized.replace(regex, "");

    // Also remove self-closing tags
    const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, "gi");
    sanitized = sanitized.replace(selfClosingRegex, "");
  }

  // Remove javascript: protocol from links
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove on* event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");

  return sanitized;
}
