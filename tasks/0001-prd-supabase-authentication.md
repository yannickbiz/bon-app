# PRD: Supabase Authentication Implementation

## Introduction/Overview

This feature implements a complete authentication system using Supabase Auth for the bon-app project. The system will provide secure user authentication with magic link as the primary method and email/password as a fallback option. All routes in the application will be protected, requiring users to authenticate before accessing any content. The authentication system will include full user management capabilities including profile management, password reset, email changes, and account deletion.

**Problem:** The application currently lacks user authentication, preventing user identification, personalized experiences, and secure access control.

**Goal:** Implement a robust, secure authentication system that protects all application routes and provides comprehensive user account management.

## Goals

1. Integrate Supabase Auth into the Next.js 15 application
2. Implement magic link authentication as the primary login method
3. Provide email/password authentication as a fallback option
4. Protect all application routes, redirecting unauthenticated users to login
5. Require email verification before granting access to the application
6. Enable users to manage their profiles (name, avatar)
7. Support password reset, email change, and soft account deletion
8. Maintain session state across page refreshes and navigation
9. Provide a seamless authentication experience with minimal friction

## User Stories

1. **As a new user**, I want to sign up using my email address and receive a magic link, so that I can access the application without creating a password.

2. **As a new user**, I want to create an account with email/password if I prefer traditional authentication, so that I have an alternative to magic links.

3. **As a registered user**, I want to verify my email address before accessing the application, so that the system ensures account validity.

4. **As an authenticated user**, I want to stay logged in across sessions, so that I don't have to re-authenticate every time I visit the app.

5. **As a user**, I want to update my profile information (name and avatar), so that I can personalize my account.

6. **As a user**, I want to reset my password if I forget it, so that I can regain access to my account.

7. **As a user**, I want to change my email address, so that I can keep my account information up to date.

8. **As a user**, I want to delete my account, so that I have control over my data and presence in the system.

9. **As a user**, I want to log out securely, so that my session is terminated and my data is protected.

10. **As an unauthenticated user**, I want to be redirected to the login page when trying to access protected content, so that I understand authentication is required.

## Functional Requirements

### Authentication Core
1. The system must integrate Supabase Auth with Next.js 15 App Router using Server Components where possible.
2. The system must support magic link authentication as the primary method.
3. The system must support email/password authentication as a fallback method.
4. The system must use Supabase client (browser) and server instances appropriately based on component context.
5. The system must maintain authentication state using cookies for server-side rendering compatibility.

### Sign Up Flow
6. The system must provide a registration form with email and password fields.
7. The system must send a verification email upon successful registration.
8. The system must validate email format and password strength during registration.
9. The system must display appropriate error messages for registration failures.
10. The system must block access to the application until the user verifies their email.

### Sign In Flow
11. The system must provide a login form with email and password fields.
12. The system must include a "Send Magic Link" option as the primary login method.
13. The system must send a magic link to the user's email when requested.
14. The system must handle magic link callback and authenticate the user.
15. The system must redirect authenticated users to the main application.

### Email Verification
16. The system must prevent unverified users from accessing any protected routes.
17. The system must display a verification pending message to unverified users.
18. The system must handle email verification callback from Supabase.
19. The system must allow users to resend verification emails.

### Route Protection
20. The system must protect all application routes except authentication pages (login, signup, verify, reset password).
21. The system must implement middleware to check authentication status on all protected routes.
22. The system must redirect unauthenticated users to the login page.
23. The system must preserve the intended destination URL for post-login redirect.

### Session Management
24. The system must persist user sessions across browser refreshes.
25. The system must handle session expiration gracefully.
26. The system must refresh tokens automatically when needed.
27. The system must provide a logout function that clears the session.

### User Profile Management
28. The system must extend the user profile with additional fields: full name and avatar URL.
29. The system must create a `profiles` table in the database linked to Supabase auth users.
30. The system must automatically create a profile record when a new user signs up.
31. The system must provide a profile page where users can view their information.
32. The system must allow users to update their name.
33. The system must allow users to update their avatar URL.
34. The system must validate profile updates and display success/error messages.

### Password Management
35. The system must provide a "Forgot Password" link on the login page.
36. The system must send a password reset email when requested.
37. The system must provide a password reset form accessible via the email link.
38. The system must validate new password strength during reset.
39. The system must allow authenticated users to change their password from their profile.

### Email Management
40. The system must allow users to update their email address from their profile.
41. The system must send a confirmation email to the new email address.
42. The system must require verification of the new email before updating.

### Account Deletion
43. The system must provide an account deletion option in the user profile.
44. The system must implement soft delete (mark profile as deleted, retain data).
45. The system must require confirmation before deleting an account.
46. The system must log the user out after account deletion.
47. The system must prevent deleted accounts from logging in.

### Error Handling
48. The system must display user-friendly error messages for authentication failures.
49. The system must handle network errors gracefully.
50. The system must log authentication errors for debugging (without exposing sensitive data).

## Non-Goals (Out of Scope)

1. **Social Authentication Providers** - OAuth providers (Google, GitHub, etc.) will not be implemented in this phase.
2. **Two-Factor Authentication (2FA)** - Multi-factor authentication is out of scope for this initial implementation.
3. **Role-Based Access Control (RBAC)** - User roles and permissions will not be implemented.
4. **Admin Dashboard** - No administrative interface for managing users.
5. **Account Recovery Without Email** - No alternative recovery methods (SMS, security questions).
6. **Custom Email Templates** - Will use Supabase default email templates.
7. **Rate Limiting** - Authentication rate limiting will rely on Supabase's built-in protections.
8. **Hard Delete** - Permanent data deletion is not included; only soft delete is supported.
9. **Avatar Upload** - Users will provide avatar URLs; file upload is not included.
10. **Multiple Sessions** - No session management across multiple devices/browsers.

## Design Considerations

### Minimal/Headless Approach
- Authentication UI will be minimal and functional, focusing on logic over elaborate design.
- Forms should be simple, accessible, and follow existing Tailwind CSS v4 styling in the project.
- Error and success states should be clearly communicated through text messages.
- Loading states should be indicated during async operations.

### User Experience
- Magic link should be presented as the primary, recommended option.
- Email/password should be available but not emphasized.
- Clear instructions should be provided for first-time users.
- Redirect flow after authentication should be smooth and intuitive.

### Accessibility
- All forms must be keyboard navigable.
- Proper ARIA labels and semantic HTML should be used.
- Error messages should be associated with form fields.

## Technical Considerations

### Dependencies
- **@supabase/supabase-js** - Core Supabase client library
- **@supabase/ssr** - Server-side rendering utilities for Next.js

### Integration Points
- **Drizzle ORM** - Extend schema with `profiles` table linked to Supabase auth.users
- **Next.js Middleware** - Implement authentication checks and redirects
- **Server Components** - Use for initial auth state and protected pages
- **Client Components** - Use for interactive auth forms and state management

### Database Schema
- Create `profiles` table with columns:
  - `id` (UUID, primary key, references auth.users)
  - `full_name` (text, nullable)
  - `avatar_url` (text, nullable)
  - `deleted_at` (timestamp, nullable, for soft delete)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)

### Security
- Never expose service role key to the client
- Use Row Level Security (RLS) policies on the profiles table
- Validate all inputs on both client and server
- Sanitize user-provided data (names, URLs)
- Use HTTPS for all authentication flows (enforced by Supabase)

### Supabase Configuration
- Enable email authentication in Supabase dashboard
- Configure email templates for verification, magic link, and password reset
- Set up redirect URLs for callbacks
- Configure site URL for proper redirect handling

## Success Metrics

1. **Authentication Completion Rate** - 90%+ of users who start signup complete the process.
2. **Magic Link Adoption** - 70%+ of users choose magic link over email/password.
3. **Email Verification Rate** - 95%+ of users verify their email within 24 hours.
4. **Session Persistence** - 0 unexpected logouts due to session management issues.
5. **Error Rate** - <2% authentication error rate (excluding user input errors).
6. **Profile Completion** - 80%+ of users add a name to their profile within first week.
7. **Password Reset Success** - 95%+ of password reset requests complete successfully.

## Implementation Details

### Session Management
- **No session timeout** - Sessions will persist until explicit logout or token expiration (handled by Supabase defaults).

### Password Requirements
Password must meet the following criteria:
- Minimum 8 characters
- Contains at least one lowercase letter (a-z)
- Contains at least one uppercase letter (A-Z)
- Contains at least one digit (0-9)
- Contains at least one symbol/special character

### Account Deletion Behavior
- **Soft delete only** - Accounts are marked as deleted but data is retained.
- **No reactivation** - Deleted accounts cannot be reactivated.
- **Related data handling** - All user-related data is kept but marked as inactive.
- **No deletion notification** - No confirmation email sent after account deletion.

### Avatar URL Validation
- **No specific validation** - Avatar URLs are accepted as-is without domain or format restrictions.

### Change Frequency Limits
- **Email changes** - Rate limited (specific limit to be determined during implementation, e.g., once per 24 hours).
- **Password changes** - No rate limit on password changes.
