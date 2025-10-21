export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

const MIN_TODO_LENGTH = 1;
const MAX_TODO_LENGTH = 500;

/**
 * Validates todo text for creation or update
 * - Must not be empty or whitespace-only
 * - Must be between 1 and 500 characters
 */
export function validateTodoText(text: string): ValidationResult {
  // Check if text is empty or undefined
  if (!text) {
    return {
      isValid: false,
      error: "Todo text is required",
    };
  }

  // Check if text is only whitespace
  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return {
      isValid: false,
      error: "Todo text cannot be empty or whitespace only",
    };
  }

  // Check minimum length
  if (trimmedText.length < MIN_TODO_LENGTH) {
    return {
      isValid: false,
      error: `Todo text must be at least ${MIN_TODO_LENGTH} character`,
    };
  }

  // Check maximum length
  if (trimmedText.length > MAX_TODO_LENGTH) {
    return {
      isValid: false,
      error: `Todo text must not exceed ${MAX_TODO_LENGTH} characters`,
    };
  }

  return {
    isValid: true,
  };
}
