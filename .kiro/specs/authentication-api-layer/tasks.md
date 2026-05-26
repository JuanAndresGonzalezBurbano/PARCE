# Implementation Plan: Authentication API Layer

## Overview

This implementation plan breaks down the Authentication API Layer into discrete, testable tasks. The API layer provides RESTful HTTP endpoints for user authentication (register, login, logout, current user) with secure session management, RBAC middleware, and comprehensive error handling. The implementation builds on existing infrastructure (AuthService, SessionManager, PasswordHasher) and follows MVC patterns with controllers in `app/Controllers/Auth/` and middleware in `app/Middleware/`.

## Tasks

- [ ] 1. Create core API infrastructure and request validation
  - [ ] 1.1 Create RequestValidator utility class
    - Implement email format validation
    - Implement password strength validation (min 8 characters)
    - Implement field presence validation
    - Implement Content-Type validation (application/json)
    - Implement JSON parsing with error handling
    - Implement request body size limit (1 MB)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ] 1.2 Create ResponseFormatter utility class
    - Implement standardized success response format (success, message, data)
    - Implement standardized error response format (success, error, fields)
    - Implement cookie setting with security attributes (httpOnly, secure, sameSite)
    - Implement cookie clearing functionality
    - Implement camelCase field name conversion
    - Implement sparse JSON (omit null fields)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 1.3 Write unit tests for RequestValidator
    - Test email validation (valid/invalid formats)
    - Test password validation (length requirements)
    - Test required field validation
    - Test Content-Type validation
    - Test JSON parsing error handling
    - Test request body size limits
    - _Requirements: 7.1-7.7, 15.1-15.7, 16.1-16.7_

  - [ ]* 1.4 Write unit tests for ResponseFormatter
    - Test success response format
    - Test error response format
    - Test cookie setting with security attributes
    - Test cookie clearing
    - Test camelCase conversion
    - Test sparse JSON output
    - _Requirements: 8.1-8.7, 11.1-11.7, 12.1-12.7_

- [ ] 2. Implement AuthMiddleware for session validation
  - [ ] 2.1 Create AuthMiddleware class
    - Implement session cookie extraction (parce_session)
    - Implement session validation via SessionManager
    - Implement user data fetching from database
    - Implement user attachment to request attributes
    - Implement 401 Unauthorized response for invalid sessions
    - Implement middleware chain continuation for valid sessions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 2.2 Write unit tests for AuthMiddleware
    - Test session cookie extraction
    - Test valid session handling
    - Test invalid session handling (401 response)
    - Test missing cookie handling (401 response)
    - Test user data attachment to request
    - Test middleware chain continuation
    - _Requirements: 10.1-10.7_

- [ ] 3. Implement RBAC middleware and role validation
  - [ ] 3.1 Create RoleValidator service class
    - Implement getUserRoles() method with active role filtering
    - Implement hasRole() method for single role check
    - Implement hasAnyRole() method for multiple role check
    - Implement hasAllRoles() method for all roles check
    - Implement role expiration checking (expires_at)
    - Implement role active status checking (is_active)
    - Create role query with JOIN on user_roles and roles tables
    - _Requirements: Design RBAC Integration section_

  - [ ] 3.2 Create RBACMiddleware class
    - Implement constructor accepting allowed roles array
    - Implement user retrieval from request attributes
    - Implement role fetching via RoleValidator
    - Implement role authorization check (hasAnyRole)
    - Implement 401 response if user not attached
    - Implement 403 Forbidden response for insufficient permissions
    - Implement middleware chain continuation for authorized users
    - _Requirements: Design Component 3 (RBACMiddleware)_

  - [ ]* 3.3 Write unit tests for RoleValidator
    - Test getUserRoles() with active roles
    - Test getUserRoles() filtering expired roles
    - Test getUserRoles() filtering inactive roles
    - Test hasRole() with valid role
    - Test hasAnyRole() with multiple roles
    - Test hasAllRoles() with all required roles
    - _Requirements: Design RBAC Integration section_

  - [ ]* 3.4 Write unit tests for RBACMiddleware
    - Test authorization with valid role
    - Test 403 response for missing role
    - Test 401 response for missing user
    - Test multiple allowed roles
    - Test middleware chain continuation
    - _Requirements: Design Component 3_

- [ ] 4. Checkpoint - Verify middleware and validation infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement AuthController registration endpoint
  - [ ] 5.1 Create AuthController class with register() method
    - Implement request validation (email, password, password_confirmation, first_name, last_name, phone)
    - Implement email uniqueness check (return 409 if exists)
    - Implement password hashing via PasswordHasher
    - Implement database transaction for user creation
    - Implement user insertion with account_status='pending_verification'
    - Implement default 'customer' role assignment via user_roles table
    - Implement session creation via SessionManager
    - Implement secure cookie setting with ResponseFormatter
    - Implement 201 Created response with user data and session
    - Implement error handling (400, 409, 500)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, Design API Endpoint 1_

  - [ ]* 5.2 Write unit tests for register endpoint
    - Test successful registration with valid data
    - Test validation errors (missing fields, invalid email)
    - Test password confirmation mismatch
    - Test duplicate email (409 response)
    - Test password hashing
    - Test default role assignment
    - Test session creation and cookie setting
    - Test response format (201 with user and session data)
    - _Requirements: 1.1-1.8, Design API Endpoint 1_

- [ ] 6. Implement AuthController login endpoint
  - [ ] 6.1 Implement login() method in AuthController
    - Implement request validation (email, password, remember)
    - Implement authentication via AuthService.authenticate()
    - Implement user role fetching from user_roles table
    - Implement session cookie setting with appropriate expiration
    - Implement remember me functionality (30-day vs 2-hour expiration)
    - Implement 200 OK response with user data, roles, and session
    - Implement error handling (400, 401, 403, 500)
    - Implement generic error messages (prevent user enumeration)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, Design API Endpoint 2_

  - [ ]* 6.2 Write unit tests for login endpoint
    - Test successful login with valid credentials
    - Test validation errors (missing fields, invalid email)
    - Test invalid credentials (401 response)
    - Test inactive account (403 response)
    - Test role fetching and inclusion in response
    - Test remember me cookie expiration (30 days)
    - Test default cookie expiration (2 hours)
    - Test generic error messages
    - _Requirements: 1.1-1.8, 19.1-19.7, Design API Endpoint 2_

- [ ] 7. Implement AuthController logout endpoint
  - [ ] 7.1 Implement logout() method in AuthController
    - Implement session ID extraction from cookie
    - Implement session destruction via AuthService.logout()
    - Implement cookie clearing (Max-Age=0)
    - Implement 200 OK response with success message
    - Implement idempotent behavior (return 200 even if session invalid)
    - Implement error handling (500)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, Design API Endpoint 3_

  - [ ]* 7.2 Write unit tests for logout endpoint
    - Test successful logout with valid session
    - Test cookie clearing
    - Test idempotent behavior (invalid session still returns 200)
    - Test response format
    - Test session destruction
    - _Requirements: 2.1-2.7, Design API Endpoint 3_

- [ ] 8. Implement AuthController current user endpoint
  - [ ] 8.1 Implement me() method in AuthController
    - Implement user retrieval from request attributes (set by AuthMiddleware)
    - Implement user role fetching from user_roles table
    - Implement 200 OK response with user data and roles
    - Implement error handling (401, 500)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, Design API Endpoint 4_

  - [ ]* 8.2 Write unit tests for me endpoint
    - Test successful user retrieval
    - Test role inclusion in response
    - Test 401 response for unauthenticated request
    - Test response format
    - _Requirements: 4.1-4.7, Design API Endpoint 4_

- [ ] 9. Checkpoint - Verify all authentication endpoints
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement rate limiting for login endpoint
  - [ ] 10.1 Create RateLimiter utility class
    - Implement in-memory storage for attempt tracking (IP-based)
    - Implement sliding window algorithm (15-minute window)
    - Implement attempt counter (max 5 attempts per IP)
    - Implement automatic expiration of tracking data
    - Implement counter reset on successful login
    - Implement concurrent request handling
    - Implement per-endpoint tracking
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [ ] 10.2 Integrate RateLimiter into login endpoint
    - Implement rate limit check before authentication
    - Implement 429 Too Many Requests response
    - Implement Retry-After header
    - Implement rate limit reset on successful login
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 10.3 Write unit tests for RateLimiter
    - Test attempt tracking
    - Test rate limit enforcement (5 attempts)
    - Test sliding window expiration (15 minutes)
    - Test counter reset on success
    - Test concurrent requests
    - Test per-endpoint tracking
    - _Requirements: 6.1-6.7, 17.1-17.7_

- [ ] 11. Implement request logging and monitoring
  - [ ] 11.1 Create RequestLogger utility class
    - Implement request logging (method, path, IP, timestamp)
    - Implement response logging (status code, response time)
    - Implement authentication failure logging
    - Implement rate limit trigger logging
    - Implement exception logging (message and stack trace)
    - Implement sensitive data filtering (passwords, session IDs, tokens)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [ ] 11.2 Integrate RequestLogger into AuthController
    - Add logging to all authentication endpoints
    - Add logging to middleware (AuthMiddleware, RBACMiddleware)
    - Add logging to error handlers
    - _Requirements: 13.1-13.7_

  - [ ]* 11.3 Write unit tests for RequestLogger
    - Test request logging format
    - Test response logging format
    - Test sensitive data filtering
    - Test exception logging
    - _Requirements: 13.1-13.7_

- [ ] 12. Implement IP address validation and tracking
  - [ ] 12.1 Create IPValidator utility class
    - Implement IP extraction from X-Forwarded-For header
    - Implement IP extraction from REMOTE_ADDR
    - Implement multiple IP handling (use first IP)
    - Implement invalid IP fallback (0.0.0.0)
    - Implement IP validation
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

  - [ ] 12.2 Integrate IPValidator into authentication flow
    - Pass IP address to AuthService.authenticate()
    - Log IP address in authentication logs
    - Log warning for IP address changes in session validation
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.7_

  - [ ]* 12.3 Write unit tests for IPValidator
    - Test X-Forwarded-For extraction
    - Test REMOTE_ADDR fallback
    - Test multiple IP handling
    - Test invalid IP fallback
    - _Requirements: 20.1-20.7_

- [ ] 13. Implement health check endpoint
  - [ ] 13.1 Create health check endpoint in AuthController
    - Implement GET /api/auth/health endpoint
    - Implement database connection check
    - Implement 200 OK response with status='healthy'
    - Implement 503 Service Unavailable response with status='unhealthy'
    - Implement version field in response
    - Implement timestamp field in response
    - Implement response time under 100ms
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [ ]* 13.2 Write unit tests for health check endpoint
    - Test healthy response
    - Test unhealthy response (database failure)
    - Test response format
    - Test response time
    - Test no authentication required
    - _Requirements: 14.1-14.7_

- [ ] 14. Configure routes and middleware pipeline
  - [ ] 14.1 Update routes configuration file
    - Add POST /api/auth/register route (public)
    - Add POST /api/auth/login route (public, with rate limiting)
    - Add POST /api/auth/logout route (AuthMiddleware)
    - Add GET /api/auth/me route (AuthMiddleware)
    - Add GET /api/auth/health route (public)
    - Configure middleware pipeline order (AuthMiddleware → RBACMiddleware)
    - Add example protected routes with RBAC
    - _Requirements: Design Middleware Configuration Examples, Design Route Group Configuration_

  - [ ]* 14.2 Write integration tests for route configuration
    - Test public routes accessible without authentication
    - Test protected routes require authentication
    - Test RBAC-protected routes require specific roles
    - Test middleware execution order
    - Test rate limiting on login endpoint
    - _Requirements: Design Middleware Architecture_

- [ ] 15. Implement error handling and exception mapping
  - [ ] 15.1 Create ErrorHandler utility class
    - Implement exception to HTTP status code mapping
    - Implement AuthenticationException → 401 mapping
    - Implement generic error message generation
    - Implement error logging (full details)
    - Implement client error response (no stack traces)
    - Implement validation error formatting
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [ ] 15.2 Integrate ErrorHandler into AuthController
    - Wrap all controller methods with try-catch
    - Use ErrorHandler for exception mapping
    - Return standardized error responses
    - _Requirements: 11.1-11.7_

  - [ ]* 15.3 Write unit tests for ErrorHandler
    - Test exception to status code mapping
    - Test error message generation
    - Test error logging
    - Test stack trace filtering
    - Test validation error formatting
    - _Requirements: 11.1-11.7_

- [ ] 16. Checkpoint - Verify complete API layer functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Create end-to-end integration tests
  - [ ]* 17.1 Write integration tests for registration flow
    - Test complete registration flow (validation → user creation → role assignment → session creation → cookie setting)
    - Test registration with duplicate email
    - Test registration with invalid data
    - Test session cookie security attributes
    - _Requirements: 1.1-1.8, Design Registration Flow_

  - [ ]* 17.2 Write integration tests for login flow
    - Test complete login flow (validation → authentication → role fetching → session creation → cookie setting)
    - Test login with invalid credentials
    - Test login with inactive account
    - Test remember me functionality
    - Test rate limiting
    - _Requirements: 1.1-1.8, 6.1-6.7, 19.1-19.7, Design Login Flow_

  - [ ]* 17.3 Write integration tests for logout flow
    - Test complete logout flow (session validation → session destruction → cookie clearing)
    - Test logout with invalid session
    - Test idempotent logout
    - _Requirements: 2.1-2.7, Design Logout Flow_

  - [ ]* 17.4 Write integration tests for protected route access
    - Test authenticated access to /api/auth/me
    - Test unauthenticated access (401 response)
    - Test RBAC-protected route access
    - Test insufficient permissions (403 response)
    - _Requirements: 4.1-4.7, 10.1-10.7, Design Protected Route Access Flow_

- [ ] 18. Final checkpoint and documentation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Unit tests validate specific components and edge cases
- Integration tests validate end-to-end flows and component interactions
- The implementation builds on existing infrastructure (AuthService, SessionManager, PasswordHasher)
- All endpoints follow standardized JSON response format
- Security measures include session fixation prevention, user enumeration protection, rate limiting, and RBAC
- Middleware pipeline ensures proper authentication and authorization checks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "7.1", "8.1"] },
    { "id": 6, "tasks": ["7.2", "8.2", "10.1"] },
    { "id": 7, "tasks": ["10.2"] },
    { "id": 8, "tasks": ["10.3", "11.1", "12.1", "13.1"] },
    { "id": 9, "tasks": ["11.2", "12.2", "13.2"] },
    { "id": 10, "tasks": ["11.3", "12.3", "14.1"] },
    { "id": 11, "tasks": ["14.2", "15.1"] },
    { "id": 12, "tasks": ["15.2"] },
    { "id": 13, "tasks": ["15.3", "17.1", "17.2", "17.3", "17.4"] }
  ]
}
```
