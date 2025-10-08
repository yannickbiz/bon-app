import { z } from "zod";

// Email validation schema
export const emailSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

// Password validation schema with custom rules
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/\d/, { message: "Password must contain at least one digit" })
  .regex(/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/, {
    message: "Password must contain at least one symbol",
  });

// Magic link login schema (email only)
export const magicLinkSchema = emailSchema;

// Email/password login schema
export const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Signup schema with full password validation
export const signupSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: passwordSchema,
});

// Type exports for TypeScript
export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
