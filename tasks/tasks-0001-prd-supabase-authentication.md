# Task List: Supabase Authentication Implementation

Based on PRD: `0001-prd-supabase-authentication.md`

## Relevant Files

- `lib/supabase/client.ts` - Browser-side Supabase client initialization
- `lib/supabase/server.ts` - Server-side Supabase client initialization
- `lib/supabase/middleware.ts` - Middleware helper for auth state management
- `lib/auth/validation.ts` - Password and email validation utilities
- `lib/auth/validation.test.ts` - Unit tests for validation utilities
- `middleware.ts` - Next.js middleware for route protection
- `db/schema.ts` - Database schema including profiles table
- `app/(auth)/login/page.tsx` - Login page with magic link and email/password
- `app/(auth)/login/__tests__/page.test.tsx` - Tests for login page
- `app/(auth)/signup/page.tsx` - Signup page
- `app/(auth)/signup/__tests__/page.test.tsx` - Tests for signup page
- `app/(auth)/verify/page.tsx` - Email verification pending page
- `app/(auth)/verify/__tests__/page.test.tsx` - Tests for verification page
- `app/(auth)/reset-password/page.tsx` - Password reset page
- `app/(auth)/reset-password/__tests__/page.test.tsx` - Tests for reset password page
- `app/(auth)/auth/callback/route.ts` - Auth callback handler for magic links and verification
- `app/(auth)/auth/callback/__tests__/route.test.ts` - Tests for callback route
- `app/(protected)/profile/page.tsx` - User profile management page
- `app/(protected)/profile/__tests__/page.test.tsx` - Tests for profile page
- `app/(protected)/layout.tsx` - Layout wrapper for protected routes
- `.env.local` - Environment variables for Supabase configuration
- `.env.example` - Example environment variables file

### Notes

- Unit tests should be placed in `__tests__/` directories alongside the code files they test
- Use `npm run test` to run all tests or `npm run test [path]` for specific tests
- The `@supabase/supabase-js` dependency is already installed
- Need to install `@supabase/ssr` for server-side rendering support

## Tasks

- [x] 0.0 Create Feature Branch
  - [x] 0.1 Create a new branch named `feature/supabase-auth` from main
  - [x] 0.2 Push the branch to remote repository

- [x] 1.0 Setup Supabase Integration and Configuration
  - [x] 1.1 Install `@supabase/ssr` package
  - [x] 1.2 Create `.env.local` file with Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
  - [x] 1.3 Create `.env.example` file with placeholder environment variables
  - [x] 1.4 Add `.env.local` to `.gitignore` if not already present
  - [x] 1.5 Update Supabase dashboard: enable email auth, configure redirect URLs, and set site URL

- [ ] 2.0 Implement Database Schema and RLS Policies
  - [x] 2.1 Update `db/schema.ts` to add `profiles` table with fields: id (uuid), full_name, avatar_url, deleted_at, created_at, updated_at
  - [x] 2.2 Generate migration files using `npm run db:generate`
  - [x] 2.3 Create RLS policies in Supabase dashboard for profiles table (users can read/update their own profile)
  - [x] 2.4 Create database trigger to auto-create profile on user signup
  - [x] 2.5 Run migrations using `npm run db:migrate`

- [ ] 3.0 Create Authentication Infrastructure and Utilities
  - [ ] 3.1 Create `lib/supabase/client.ts` with browser-side Supabase client
  - [ ] 3.2 Create `lib/supabase/server.ts` with server-side Supabase client using cookies
  - [ ] 3.3 Create `lib/supabase/middleware.ts` with helper functions for middleware auth checks
  - [ ] 3.4 Create `lib/auth/validation.ts` with password validation (8+ chars, uppercase, lowercase, digit, symbol) and email validation functions
  - [ ] 3.5 Write tests in `lib/auth/validation.test.ts` for validation utilities
  - [ ] 3.6 Run tests with `npm run test lib/auth/validation.test.ts`

- [ ] 4.0 Build Authentication Pages and Flows
  - [ ] 4.1 Create `app/(auth)` route group directory
  - [ ] 4.2 Create `app/(auth)/login/page.tsx` with magic link (primary) and email/password (fallback) options
  - [ ] 4.3 Create `app/(auth)/signup/page.tsx` with email/password registration form
  - [ ] 4.4 Create `app/(auth)/verify/page.tsx` to display email verification pending message and resend option
  - [ ] 4.5 Create `app/(auth)/reset-password/page.tsx` with forgot password and reset password forms
  - [ ] 4.6 Create `app/(auth)/auth/callback/route.ts` to handle OAuth callbacks, magic links, and email verification
  - [ ] 4.7 Write tests for login page in `app/(auth)/login/__tests__/page.test.tsx`
  - [ ] 4.8 Write tests for signup page in `app/(auth)/signup/__tests__/page.test.tsx`
  - [ ] 4.9 Write tests for verify page in `app/(auth)/verify/__tests__/page.test.tsx`
  - [ ] 4.10 Write tests for reset password page in `app/(auth)/reset-password/__tests__/page.test.tsx`
  - [ ] 4.11 Write tests for callback route in `app/(auth)/auth/callback/__tests__/route.test.ts`

- [ ] 5.0 Implement Route Protection and Middleware
  - [ ] 5.1 Create `middleware.ts` at project root to check authentication status
  - [ ] 5.2 Implement redirect logic: unauthenticated users to /login, unverified users to /verify
  - [ ] 5.3 Define public routes (login, signup, verify, reset-password, auth callback)
  - [ ] 5.4 Preserve intended destination URL for post-login redirect
  - [ ] 5.5 Handle session refresh and token management in middleware
  - [ ] 5.6 Test middleware by accessing protected and public routes

- [ ] 6.0 Build User Profile Management
  - [ ] 6.1 Create `app/(protected)` route group directory
  - [ ] 6.2 Create `app/(protected)/layout.tsx` wrapper for authenticated routes
  - [ ] 6.3 Create `app/(protected)/profile/page.tsx` with profile view and edit forms
  - [ ] 6.4 Implement profile name update functionality
  - [ ] 6.5 Implement avatar URL update functionality
  - [ ] 6.6 Implement password change functionality with validation
  - [ ] 6.7 Implement email change functionality with rate limiting (once per 24 hours)
  - [ ] 6.8 Implement soft account deletion with confirmation dialog
  - [ ] 6.9 Add logout functionality
  - [ ] 6.10 Write tests for profile page in `app/(protected)/profile/__tests__/page.test.tsx`
  - [ ] 6.11 Update `app/page.tsx` to redirect authenticated users or show appropriate content

- [ ] 7.0 Testing and Validation
  - [ ] 7.1 Run full test suite with `npm run test`
  - [ ] 7.2 Fix any failing tests
  - [ ] 7.3 Run `npm run lint` and fix any linting errors
  - [ ] 7.4 Run `npm run build` to ensure production build succeeds
  - [ ] 7.5 Manually test complete signup flow (email/password)
  - [ ] 7.6 Manually test magic link login flow
  - [ ] 7.7 Manually test email verification requirement
  - [ ] 7.8 Manually test password reset flow
  - [ ] 7.9 Manually test profile management (update name, avatar, password, email)
  - [ ] 7.10 Manually test account deletion and verify soft delete
  - [ ] 7.11 Manually test route protection and redirects
  - [ ] 7.12 Verify session persistence across browser refresh
