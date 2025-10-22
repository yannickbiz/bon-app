export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

const MIN_TITLE_LENGTH = 1;
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 50000;

/**
 * Validates note title for creation or update
 * - Must not be empty or whitespace-only
 * - Must be between 1 and 100 characters
 */
export function validateNoteTitle(title: string): ValidationResult {
  // Check if title is empty or undefined
  if (!title) {
    return {
      isValid: false,
      error: "Note title is required",
    };
  }

  // Check if title is only whitespace
  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return {
      isValid: false,
      error: "Note title cannot be empty or whitespace only",
    };
  }

  // Check minimum length
  if (trimmedTitle.length < MIN_TITLE_LENGTH) {
    return {
      isValid: false,
      error: `Note title must be at least ${MIN_TITLE_LENGTH} character`,
    };
  }

  // Check maximum length
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return {
      isValid: false,
      error: `Note title must not exceed ${MAX_TITLE_LENGTH} characters`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates note content for creation or update
 * - Can be empty (optional)
 * - Must not exceed 50,000 characters
 */
export function validateNoteContent(content: string): ValidationResult {
  // Content is optional, so empty string is valid
  if (!content) {
    return {
      isValid: true,
    };
  }

  // Check maximum length
  if (content.length > MAX_CONTENT_LENGTH) {
    return {
      isValid: false,
      error: `Note content must not exceed ${MAX_CONTENT_LENGTH} characters`,
    };
  }

  return {
    isValid: true,
  };
}
