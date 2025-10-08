# PRD: Email OTP Authentication System with Password Fallback

## Introduction/Overview

This feature adds email OTP (One-Time Password) as the primary authentication method while keeping email/password authentication as a fallback option. Users will enter their email address and receive a 6-digit numeric code to verify their identity. The system will prioritize OTP for a modern, password-free experience but allow users to fall back to traditional password authentication if needed.

**Problem Solved**: Current authentication relies heavily on password management. OTP provides faster authentication, reduces password-related issues (forgotten passwords, weak passwords), and offers a more modern, mobile-friendly authentication experience while maintaining a safety net for users who prefer or need password authentication.

**Goal**: Implement a secure, user-friendly email OTP authentication system as the primary method, with email/password as a secondary fallback option, working seamlessly for both new and existing users with improved session management.

## Goals

1. Add email OTP as the primary authentication method while keeping email/password as fallback
2. Provide a seamless single-screen authentication experience where users enter email and OTP in one flow
3. Implement secure OTP generation, delivery, and validation with appropriate rate limiting
4. Remove magic link authentication method completely
5. Extend session duration to reduce frequent re-authentication needs while maintaining security
6. Maintain compatibility with existing Supabase Auth infrastructure and middleware
7. Provide clear UI affordance for users to switch to password authentication if OTP fails or is unavailable

## User Stories

1. **As a new user**, I want to sign up using my email address and a verification code as the default option, so that I can quickly create an account without choosing a password.

2. **As a new user who prefers passwords**, I want the option to switch to password authentication during signup, so that I can create an account using my preferred method.

3. **As an existing user**, I want to log in by entering my email and receiving a code, so that I can access my account without remembering a password.

4. **As an existing user with password issues**, I want to easily switch to password login if OTP isn't working, so that I have a reliable fallback authentication method.

5. **As a user who didn't receive the OTP**, I want to request a new code after 30 seconds, so that I can complete authentication even if the email was delayed or lost.

6. **As a user entering an incorrect OTP**, I want clear feedback on what went wrong and the option to use password instead, so that I'm not blocked from accessing my account.

7. **As a returning user**, I want my session to last longer so that I don't have to re-authenticate frequently during normal usage.

8. **As a user on mobile**, I want the OTP input to trigger a numeric keyboard and potentially auto-fill from SMS/email, so that entering the code is quick and easy.

## Functional Requirements

### Core Authentication Flow

1. The system must display a single authentication screen with an email input field as the primary interface.
2. The system must validate email format before allowing OTP request.
3. The system must send a 6-digit numeric OTP to the user's email address within 30 seconds.
4. The system must display the OTP input field immediately after email submission (same screen).
5. The system must show a countdown timer indicating when the user can request a new OTP (30 seconds).
6. The system must support both sign-up and sign-in using the identical OTP flow (no distinction).
7. The system must automatically create a new user account if the email doesn't exist in the database (OTP flow only).
8. The system must validate OTP codes server-side before granting access.
9. The system must redirect authenticated users to the intended page (using `?next=` parameter) or default dashboard.

### Password Fallback Flow

10. The system must display a "Use password instead" link/button on the OTP screen.
11. The system must switch to a password input field when user selects password fallback option.
12. The system must support standard email/password authentication for existing users with passwords.
13. The system must provide "Sign up with password" option for new users who prefer password authentication.
14. The system must include password strength validation (minimum 8 characters) for new password creation.
15. The system must maintain existing "Forgot password" functionality for password reset flow.
16. The system must allow users to switch back to OTP flow from password view.

### OTP Generation & Security

17. The system must generate cryptographically secure 6-digit numeric codes (000000-999999).
18. The system must set OTP expiration to 10 minutes from generation time.
19. The system must invalidate previously generated OTPs when a new one is requested for the same email.
20. The system must rate limit OTP requests to maximum 3 requests per email per hour.
21. The system must prevent OTP requests from the same IP for more than 10 emails per hour (anti-abuse).
22. The system must provide clear error messages when rate limits are exceeded.

### Session Management

23. The system must extend session duration to 30 days (with 7-day refresh window) to reduce re-authentication frequency.
24. The system must maintain the existing middleware session refresh logic.
25. The system must keep users logged in across browser sessions (persistent sessions).
26. The system must provide a logout option that immediately invalidates the session.

### User Interface

27. The system must use a clean, single-screen interface for the entire auth flow.
28. The system must show loading states during OTP sending and verification.
29. The system must display success confirmation before redirecting after successful authentication.
30. The system must show input validation errors inline (invalid email format, invalid OTP format, weak password).
31. The system must use numeric input type for OTP field to trigger appropriate mobile keyboards.
32. The system must auto-focus the OTP input field after email submission.
33. The system must support pasting OTP codes from clipboard.
34. The system must show "Resend OTP" button that becomes enabled after 30 seconds.
35. The system must display "Use password instead" link prominently below OTP input or when OTP fails.
36. The system must show "Back to OTP" option when in password mode.
37. The system must use consistent shadcn/ui components (Button, Input, Card) across both OTP and password flows.

### Email Delivery

38. The system must send OTP emails using Supabase Auth email templates.
39. The email must include the 6-digit code prominently displayed.
40. The email must include the expiration time (10 minutes).
41. The email must include a warning not to share the code.
42. The email subject must be clear (e.g., "Your Sign-In Code for [App Name]").

### Migration & Backward Compatibility

43. The system must remove magic link authentication UI and functionality completely.
44. The system must preserve existing password credentials for users who already have passwords.
45. The system must make OTP the default/primary authentication method for all users.
46. The system must maintain existing user records and associations (user IDs remain unchanged).
47. The system must update all auth-related pages: `/login`, `/signup` to use unified OTP+password flow.
48. The system must keep `/reset-password` functionality for password recovery.
49. The system must redirect or remove `/verify` page (no longer needed for magic links).

### Error Handling

50. The system must handle expired OTP codes with a clear message prompting to request a new code.
51. The system must handle invalid OTP codes with a message indicating the code is incorrect.
52. The system must handle network failures gracefully with retry options.
53. The system must handle rate limit errors with a message indicating when the user can try again.
54. The system must handle incorrect password attempts with appropriate error messages.
55. The system must log all authentication attempts and failures for security monitoring.
56. The system must suggest password fallback when OTP delivery fails multiple times.

## Non-Goals (Out of Scope)

1. **Multi-factor authentication (MFA)** - OTP is the single authentication factor; additional MFA layers are not included.
2. **SMS OTP delivery** - Only email OTP is supported; no SMS gateway integration.
3. **Social authentication** - OAuth providers (Google, GitHub, etc.) are not included in this iteration.
4. **Biometric authentication** - Fingerprint, Face ID, etc., are not supported.
5. **Custom email templates in this phase** - Using Supabase default templates with minor customization only.
6. **Remember device functionality** - Users must enter OTP on every login regardless of device.
7. **Account recovery without email access** - Users must have email access to authenticate; no alternative recovery methods.
8. **Removing existing password authentication** - Passwords remain as a fallback option, not eliminated.

## Design Considerations

### UI/UX Guidelines

- **Primary OTP Flow**: Email input and OTP input on same page, with OTP section appearing after email submission
- **Password Fallback**: Clear "Use password instead" link that switches to password input on the same screen
- **Visual Feedback**: Use existing shadcn/ui components (Input, Button, Card) with loading states and animations
- **Theme Support**: Must work seamlessly in light, dark, and system theme modes
- **Mobile Optimization**: Responsive design with appropriate input types and auto-focus behavior
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
- **Progressive Enhancement**: Show password option after OTP failures or immediately as a secondary option

### Component Structure

```
app/(auth)/
├── auth/
│   ├── page.tsx              # New unified OTP+password auth page
│   └── __tests__/
│       └── page.test.tsx     # Test suite for OTP and password flows
├── reset-password/
│   └── page.tsx              # Keep existing password reset
└── verify/                   # Remove or redirect (magic link deprecated)
```

Existing pages (`/login`, `/signup`) should redirect to `/auth`.

### State Management

- Client-side form state for email, OTP input, password input, loading states
- Auth mode state: "otp" or "password" to toggle between flows
- Server-side OTP verification using Supabase Auth API
- Server-side password authentication using existing Supabase methods
- Countdown timer for resend button using client-side state

## Technical Considerations

### Supabase Auth Integration

1. **OTP Generation**: Use Supabase Auth `signInWithOtp()` method with email channel
2. **OTP Verification**: Verify OTP tokens using `verifyOtp()` in server components
3. **Password Authentication**: Use existing `signInWithPassword()` and `signUp()` methods
4. **Session Management**: Configure Supabase client with extended session duration (30 days)
5. **Rate Limiting**: Implement rate limiting at middleware level before Supabase calls

### Implementation Notes

- Update `lib/supabase/server.ts` and `lib/supabase/client.ts` if needed for session config
- Modify `middleware.ts` to handle new `/auth` route as public, remove `/verify` if applicable
- Update protected layout to work seamlessly with new auth flow
- Add rate limiting logic using in-memory store or Supabase database tables
- Keep existing password reset logic from `/reset-password` page
- Remove magic link related code and UI components

### Database Schema (Optional)

Consider adding an `auth_attempts` table to track OTP requests for rate limiting:
```sql
- email (text)
- attempt_type (enum: 'otp_request', 'otp_verify')
- ip_address (text)
- created_at (timestamp)
- success (boolean)
```

### Testing Requirements

1. Unit tests for OTP input validation
2. Unit tests for password input validation
3. Integration tests for OTP send/verify flow
4. Integration tests for password authentication flow
5. Integration tests for switching between OTP and password modes
6. Rate limiting tests (mock time to simulate multiple requests)
7. Session persistence tests
8. Error handling tests (expired OTP, invalid OTP, incorrect password, network failures)

## Success Metrics

1. **OTP Adoption Rate**: >70% of authentication attempts use OTP instead of password within 30 days
2. **Authentication Success Rate**: >95% of authentication attempts (OTP or password) succeed within first try
3. **Time to Authenticate**: Average time from email entry to successful login <60 seconds for OTP flow
4. **Session Duration**: Average session length increases from current baseline by 50%+
5. **Password Fallback Usage**: <20% of users fall back to password authentication
6. **Email Delivery**: 99%+ of OTP emails delivered within 30 seconds
7. **Failed Attempts**: <5% of users hit rate limiting errors during normal usage
8. **Support Tickets**: 50% reduction in password-related support tickets (still keeping password option)

## Open Questions

1. **Email Provider Deliverability**: Have we tested Supabase email delivery rates and spam folder placement? May need to configure custom SMTP or email provider. No.

2. **Branding & Email Templates**: Should we customize the OTP email template beyond defaults? Do we need to add company logo, custom styling? No.

3. **User Communication**: How will we notify existing users about the auth change? Email announcement, in-app banner, or discovery on next login? No.

4. **Session Security Trade-off**: Is 30-day session duration acceptable from security perspective, or should we implement "remember me" checkbox to let users choose? Yes, for now.

5. **Analytics Integration**: Should we add analytics events (e.g., Mixpanel, Amplitude) to track authentication funnel and drop-off points? No.

6. **International Users**: Do we need to consider internationalization (i18n) for different languages in the OTP email and UI? No, for now.

7. **Accessibility Audit**: Should we conduct a formal accessibility audit before launch to ensure WCAG 2.1 AA compliance? No, for now.

8. **Rollback Plan**: What is the rollback strategy if OTP authentication causes major issues? Keep old auth code in separate branch for quick revert? No.
