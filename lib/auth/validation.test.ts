import { describe, expect, it } from "vitest";
import { validateEmail, validatePassword } from "./validation";

describe("validatePassword", () => {
  it("should pass for valid password with all requirements", () => {
    const result = validatePassword("Test123!@#");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should fail for password less than 8 characters", () => {
    const result = validatePassword("Test1!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 8 characters long",
    );
  });

  it("should fail for password without lowercase letter", () => {
    const result = validatePassword("TEST123!@#");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one lowercase letter",
    );
  });

  it("should fail for password without uppercase letter", () => {
    const result = validatePassword("test123!@#");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one uppercase letter",
    );
  });

  it("should fail for password without digit", () => {
    const result = validatePassword("TestTest!@#");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one digit");
  });

  it("should fail for password without symbol", () => {
    const result = validatePassword("Test1234");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one symbol",
    );
  });

  it("should return multiple errors for password with multiple issues", () => {
    const result = validatePassword("test");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("should pass for password with various symbols", () => {
    expect(validatePassword("Test123!").isValid).toBe(true);
    expect(validatePassword("Test123@").isValid).toBe(true);
    expect(validatePassword("Test123#").isValid).toBe(true);
    expect(validatePassword("Test123$").isValid).toBe(true);
  });
});

describe("validateEmail", () => {
  it("should pass for valid email addresses", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user.name@domain.co.uk")).toBe(true);
    expect(validateEmail("user+tag@example.com")).toBe(true);
  });

  it("should fail for invalid email addresses", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("user@domain")).toBe(false);
    expect(validateEmail("user domain@example.com")).toBe(false);
  });

  it("should fail for empty string", () => {
    expect(validateEmail("")).toBe(false);
  });
});
