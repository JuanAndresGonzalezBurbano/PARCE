# Implementation Plan: Authentication Infrastructure Layer

## Overview

This implementation plan creates the Security Foundation Layer for the P.A.R.C.E PHP 8.2 MVC application. The plan focuses on four core components: PasswordHasher (password hashing with Argon2id), SessionManager (database-backed session management), DTOs (immutable data transfer objects), and AuthService (core authentication operations). The implementation follows strict MVC separation, uses PHP 8.2 features (readonly classes, typed properties, constructor property promotion), and integrates with the existing Database, Session, and RBAC infrastructure.

**Scope**: Security Foundation Layer ONLY (PasswordHasher, SessionManager, DTOs, AuthService)  
**Out of Scope**: CSRF Protection, Rate Limiting, Token Generation, Middleware components

## Tasks

- [x] 1. Set up authentication infrastructure directory structure and DTOs
  - Create `app/Infrastructure/Auth/` directory structure
  - Create `app/Infrastructure/Auth/DTO/` subdirectory
  - Create `app/Infrastructure/Auth/Services/` subdirectory
  - Create `app/Infrastructure/Auth/Exceptions/` subdirectory
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

  - [x] 1.1 Implement CookieConfig DTO
    - Create `app/Infrastructure/Auth/DTO/CookieConfig.php`
    - Implement as readonly class with constructor property promotion
    - Add properties: name, lifetime, path, domain, secure, httpOnly, sameSite
    - Implement `secure()` static factory method with recommended defaults
    - Add validation in constructor for path (must start with '/') and sameSite (must be 'Strict', 'Lax', or 'None')
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 25.3_

  - [ ] 1.2 Write property test for CookieConfig
    - **Property 10: Cookie Security**
    - **Property 15: CookieConfig Path Validation**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.5**
    - Test that all CookieConfig instances have httpOnly=true, secure=true in production, sameSite in valid set
    - Test that path always starts with '/'
    - Generate random valid cookie configurations and verify constraints

  - [x] 1.3 Implement RateLimitConfig DTO
    - Create `app/Infrastructure/Auth/DTO/RateLimitConfig.php`
    - Implement as readonly class with constructor property promotion
    - Add properties: maxAttempts, decayMinutes, lockoutMinutes
    - Add validation in constructor (maxAttempts: 1-100, decayMinutes: 1-1440, lockoutMinutes: 1-1440)
    - Implement `default()` static factory method (5, 15, 30)
    - Implement `strict()` static factory method (3, 10, 60)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 25.4_

  - [ ] 1.4 Write property test for RateLimitConfig
    - **Property 16: RateLimitConfig Bounds**
    - **Validates: Requirements 13.1, 13.2, 13.3**
    - Test that all RateLimitConfig instances satisfy: 1 ≤ maxAttempts ≤ 100, 1 ≤ decayMinutes ≤ 1440, 1 ≤ lockoutMinutes ≤ 1440
    - Generate random configurations within bounds and verify acceptance
    - Generate configurations outside bounds and verify rejection

  - [x] 1.5 Implement SessionData DTO
    - Create `app/Infrastructure/Auth/DTO/SessionData.php`
    - Implement as readonly class with constructor property promotion
    - Add properties: id, userId, ipAddress, userAgent, lastActivity, createdAt, expiresAt
    - Implement `isExpired()` method checking if current time > expiresAt
    - Implement `isIdle(int $maxIdleSeconds)` method checking if (current time - lastActivity) > threshold
    - Add validation in constructor (userId > 0, valid IP format, valid timestamps)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 25.2_

  - [ ] 1.6 Write property test for SessionData
    - **Property 14: SessionData Validation**
    - **Validates: Requirements 11.3, 11.4, 11.5**
    - Test that all SessionData instances have userId > 0, valid IP address format, lastActivity > 0, createdAt > 0
    - Generate random session data and verify validation rules
    - Test isExpired() and isIdle() methods with various timestamps

  - [x] 1.7 Implement AuthResult DTO
    - Create `app/Infrastructure/Auth/DTO/AuthResult.php`
    - Implement as readonly class with constructor property promotion
    - Add properties: success, userId, sessionId, message, errors
    - Implement `success(int $userId, string $sessionId)` static factory method
    - Implement `failure(string $message, ?array $errors = null)` static factory method
    - Add validation in constructor (if success=true, userId and sessionId must not be null; if success=false, message must be provided)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 25.1_

  - [ ] 1.8 Write property test for AuthResult
    - **Property 13: AuthResult Consistency**
    - **Validates: Requirements 10.3, 10.4**
    - Test that all AuthResult instances satisfy: (success=true ⟹ userId≠null ∧ sessionId≠null) ∧ (success=false ⟹ message≠null)
    - Generate random successful and failed results and verify consistency
    - Test factory methods produce valid instances

  - [x] 1.9 Implement AuthenticationException
    - Create `app/Infrastructure/Auth/Exceptions/AuthenticationException.php`
    - Extend from base Exception class
    - Add constructor accepting message, code, and previous exception
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 2. Checkpoint - Verify DTO structure and validation
  - Ensure all DTOs are readonly classes with proper validation
  - Ensure all property tests pass for DTOs
  - Ask the user if questions arise

- [x] 3. Implement PasswordHasher service
  - [x] 3.1 Create PasswordHasher class with hash method
    - Create `app/Infrastructure/Auth/Services/PasswordHasher.php`
    - Implement `hash(string $password): string` method using PASSWORD_ARGON2ID
    - Add password length validation (minimum 8 characters)
    - Throw AuthenticationException for invalid passwords
    - Ensure hash output starts with "$argon2id$" prefix
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 3.2 Write property test for password hashing
    - **Property 1: Password Security**
    - **Property 6: Password Verification Round-Trip**
    - **Property 20: Hash Non-Determinism**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5, 2.1, 2.2**
    - Test that hash(password) produces Argon2id hash (starts with "$argon2id$")
    - Test that verify(password, hash(password)) = true for all passwords
    - Test that hash(password) ≠ hash(password) (different salts)
    - Generate random passwords and verify properties

  - [x] 3.3 Add verify method to PasswordHasher
    - Implement `verify(string $password, string $hash): bool` method
    - Use `password_verify()` for timing-safe comparison
    - Return true if password matches hash, false otherwise
    - Ensure constant execution time regardless of result
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.4 Write property test for password verification
    - **Property 2: Timing Attack Prevention**
    - **Property 7: Password Verification Rejection**
    - **Validates: Requirements 2.3, 2.4, 24.1, 24.2, 24.3, 24.4**
    - Test that verify(password1, hash) and verify(password2, hash) have similar execution times
    - Test that verify(password1, hash(password2)) = false when password1 ≠ password2
    - Measure timing variance and ensure it's below threshold

  - [x] 3.5 Add needsRehash method to PasswordHasher
    - Implement `needsRehash(string $hash): bool` method
    - Use `password_needs_rehash()` to detect outdated algorithm
    - Return true if hash needs rehashing, false otherwise
    - _Requirements: 2.5, 16.1_

  - [ ] 3.6 Write unit tests for PasswordHasher
    - Test hash() with valid passwords (≥8 characters)
    - Test hash() rejects short passwords (<8 characters)
    - Test verify() returns true for correct password
    - Test verify() returns false for incorrect password
    - Test needsRehash() detects outdated hashes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.5_

- [x] 4. Checkpoint - Verify PasswordHasher functionality
  - Ensure all PasswordHasher tests pass
  - Verify Argon2id hashing works correctly
  - Verify timing-safe comparison
  - Ask the user if questions arise

- [x] 5. Implement SessionManager service
  - [x] 5.1 Create SessionManager class with create method
    - Create `app/Infrastructure/Auth/Services/SessionManager.php`
    - Inject Database dependency via constructor
    - Implement `create(int $userId, array $metadata): string` method
    - Generate cryptographically secure session ID using `bin2hex(random_bytes(20))` (40 characters)
    - Build JSON payload with user_id, expires_at, max_idle_seconds, remember, created_at, ip_address, user_agent
    - Insert session into sessions table with id, user_id, ip_address, user_agent, payload, last_activity
    - Return session ID
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 19.1, 19.2, 19.3, 19.4, 23.2_

  - [ ] 5.2 Write property test for session creation
    - **Property 3: Session Uniqueness**
    - **Property 8: Session ID Format**
    - **Property 11: Session Metadata Preservation**
    - **Property 18: Session Payload Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.6, 4.4, 19.1, 19.2, 19.3, 19.5, 23.2**
    - Test that all generated session IDs are unique (collision probability < 2^-128)
    - Test that all session IDs are exactly 40 characters and hexadecimal
    - Test that create(userId, metadata) preserves metadata in payload
    - Test that payload contains all required fields
    - Generate multiple sessions and verify uniqueness and format

  - [x] 5.3 Add validate method to SessionManager
    - Implement `validate(string $sessionId): ?SessionData` method
    - Fetch session from database by id
    - Return null if session doesn't exist
    - Decode JSON payload and extract expires_at, max_idle_seconds
    - Check absolute expiration: if current time > expires_at, delete session and return null
    - Check idle timeout: if (current time - last_activity) > max_idle_seconds, delete session and return null
    - Update last_activity to current timestamp
    - Return SessionData object with session information
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 19.5_

  - [ ] 5.4 Write property test for session validation
    - **Property 4: Session Expiration**
    - **Property 5: Session Idle Timeout**
    - **Property 12: Session Activity Update**
    - **Validates: Requirements 5.3, 5.4, 6.1, 6.2, 6.3, 5.5, 7.4**
    - Test that validate() returns null for expired sessions (current time > expires_at)
    - Test that validate() returns null for idle sessions (current time - last_activity > max_idle_seconds)
    - Test that validate() updates last_activity for valid sessions
    - Create sessions with various expiration times and verify behavior

  - [x] 5.5 Add destroy method to SessionManager
    - Implement `destroy(string $sessionId): bool` method
    - Delete session from database by id
    - Return true if session was deleted, false if session didn't exist
    - _Requirements: 9.3, 9.4, 15.1, 15.2, 15.3, 15.4_

  - [x] 5.6 Add regenerate method to SessionManager
    - Implement `regenerate(string $sessionId): string` method
    - Fetch existing session from database
    - Return empty string if session doesn't exist
    - Generate new cryptographically secure session ID
    - Delete old session from database
    - Create new session with new ID, same user_id and metadata
    - Update last_activity to current timestamp
    - Return new session ID
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 5.7 Write property test for session regeneration
    - **Property 9: Session Regeneration Security**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.5**
    - Test that regenerate(sessionId) invalidates old session ID
    - Test that regenerate(sessionId) creates new valid session
    - Test that new session ID is different from old session ID
    - Test that new session preserves user_id and metadata

  - [x] 5.8 Add destroyAllUserSessions method to SessionManager
    - Implement `destroyAllUserSessions(int $userId): int` method
    - Delete all sessions from database where user_id matches
    - Return count of deleted sessions
    - _Requirements: 9.1, 9.2, 22.1, 22.2, 22.3, 22.4_

  - [ ] 5.9 Write property test for session destruction
    - **Property 17: Session Destruction Completeness**
    - **Validates: Requirements 9.1, 22.3**
    - Test that destroyAllUserSessions(userId) removes all sessions for that user
    - Test that after destruction, no sessions exist with that user_id
    - Create multiple sessions for a user and verify complete destruction

  - [x] 5.10 Add cleanup method to SessionManager
    - Implement `cleanup(): int` method
    - Delete sessions where last_activity < (current time - max_idle_seconds)
    - Delete sessions where expires_at < current time
    - Return count of deleted sessions
    - Use batched deletion to avoid table locks
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 5.11 Write unit tests for SessionManager
    - Test create() generates valid session ID and stores in database
    - Test validate() returns null for non-existent session
    - Test validate() returns null for expired session
    - Test validate() returns null for idle session
    - Test validate() returns SessionData for valid session
    - Test destroy() removes session from database
    - Test regenerate() creates new session and removes old
    - Test destroyAllUserSessions() removes all user sessions
    - Test cleanup() removes expired sessions
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 8.1, 8.2, 9.1_

- [x] 6. Checkpoint - Verify SessionManager functionality
  - Ensure all SessionManager tests pass
  - Verify session creation, validation, and cleanup work correctly
  - Verify database integration
  - Ask the user if questions arise

- [ ] 7. Implement AuthService
  - [x] 7.1 Create AuthService class with authenticate method
    - Create `app/Infrastructure/Auth/Services/AuthService.php`
    - Inject Database, PasswordHasher, and SessionManager dependencies via constructor
    - Implement `authenticate(string $email, string $password, bool $remember = false): AuthResult` method
    - Validate email format and password length (≥8 characters)
    - Fetch user from database by email (include account_status check)
    - If user not found, perform dummy hash operation (timing-safe) and return failure
    - Check account_status is 'active', return failure if not
    - Verify password using PasswordHasher
    - If password invalid, return AuthResult::failure('Invalid credentials')
    - Check if password needs rehashing, update if needed
    - Create session using SessionManager with metadata (ip_address, user_agent, remember)
    - Update user's last_login_at and last_login_ip in database
    - Return AuthResult::success with userId and sessionId
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 16.1, 16.2, 16.3, 16.4, 18.1, 18.2, 18.3, 18.4, 24.1, 24.2, 24.3, 24.4_

  - [ ] 7.2 Write property test for authentication timing safety
    - **Property 19: Authentication Error Message Uniformity**
    - **Validates: Requirements 3.2, 18.4, 24.1, 24.3, 24.4**
    - Test that authenticate() with non-existent email returns same error message as invalid password
    - Test that execution time is similar for valid and invalid emails
    - Verify dummy hash operation is performed for non-existent users

  - [x] 7.3 Add logout method to AuthService
    - Implement `logout(string $sessionId): bool` method
    - Call SessionManager::destroy() to remove session
    - Return true if session was destroyed, false otherwise
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 7.4 Add validateSession method to AuthService
    - Implement `validateSession(string $sessionId): ?SessionData` method
    - Call SessionManager::validate() to check session validity
    - Return SessionData if valid, null otherwise
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 7.5 Add isAuthenticated and getCurrentUser methods to AuthService
    - Implement `isAuthenticated(): bool` method checking if valid session exists in current request
    - Implement `getCurrentUser(): ?array` method returning user data from database for current session
    - Store session validation result in instance variable to avoid repeated database queries
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 7.6 Add refreshSession method to AuthService
    - Implement `refreshSession(string $sessionId): bool` method
    - Call SessionManager::validate() to update last_activity
    - Return true if session was refreshed, false if session doesn't exist
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

  - [ ] 7.7 Write unit tests for AuthService
    - Test authenticate() with valid credentials creates session
    - Test authenticate() with invalid credentials returns failure
    - Test authenticate() with non-existent email returns failure
    - Test authenticate() with suspended account returns failure
    - Test authenticate() updates last_login_at and last_login_ip
    - Test authenticate() performs dummy hash for non-existent users
    - Test authenticate() rehashes outdated passwords
    - Test logout() destroys session
    - Test validateSession() returns SessionData for valid session
    - Test validateSession() returns null for invalid session
    - Test isAuthenticated() returns true with valid session
    - Test isAuthenticated() returns false without session
    - Test getCurrentUser() returns user data with valid session
    - Test getCurrentUser() returns null without session
    - Test refreshSession() updates last_activity
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 14.1, 14.2, 14.3, 14.4, 15.1, 15.2, 16.1, 16.2, 20.1, 20.2, 24.1, 24.3_

- [ ] 8. Checkpoint - Verify AuthService functionality
  - Ensure all AuthService tests pass
  - Verify authentication flow works end-to-end
  - Verify timing-safe operations
  - Verify integration with PasswordHasher and SessionManager
  - Ask the user if questions arise

- [ ] 9. Integration and final validation
  - [ ] 9.1 Create integration test for full authentication flow
    - Test complete login flow: authenticate() → session created → validateSession() returns valid data
    - Test logout flow: authenticate() → logout() → validateSession() returns null
    - Test session expiration: create session → wait for expiration → validateSession() returns null
    - Test session regeneration: authenticate() → regenerate() → old session invalid, new session valid
    - Test concurrent sessions: authenticate twice → both sessions valid → destroyAllUserSessions() → both invalid
    - _Requirements: 3.1, 3.5, 4.1, 5.1, 5.3, 6.1, 6.2, 7.1, 9.1, 15.1, 22.1_

  - [ ] 9.2 Write integration tests for database interactions
    - Test that sessions are correctly stored in sessions table
    - Test that last_login_at and last_login_ip are updated in users table
    - Test that expired sessions are removed from database
    - Test that session cleanup removes old sessions
    - Verify database indexes are used efficiently
    - _Requirements: 4.3, 3.6, 5.3, 6.3, 8.1, 8.2, 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 9.3 Verify PSR-4 autoloading and namespace structure
    - Ensure all classes follow PSR-4 autoloading conventions
    - Verify namespace structure: App\Infrastructure\Auth\Services, App\Infrastructure\Auth\DTO, App\Infrastructure\Auth\Exceptions
    - Test that classes can be autoloaded correctly
    - Verify no namespace conflicts with existing code

  - [ ] 9.4 Verify PHP 8.2 feature usage
    - Ensure all DTOs use readonly classes
    - Ensure all DTOs use constructor property promotion
    - Ensure all classes use typed properties
    - Verify no deprecated PHP features are used

- [ ] 10. Final checkpoint - Complete validation
  - Ensure all tests pass (unit, property-based, integration)
  - Verify all requirements are covered by implementation
  - Verify all correctness properties are validated by tests
  - Verify compatibility with existing RBAC architecture
  - Verify no technical debt introduced
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from design document
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows and database interactions
- All components use PHP 8.2 features (readonly classes, typed properties, constructor property promotion)
- All components integrate with existing Database, Session, and RBAC infrastructure
- Implementation maintains strict MVC separation
- Out of scope: CSRF Protection, Rate Limiting, Token Generation, Middleware components

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.3", "1.5", "1.7", "1.9"]
    },
    {
      "id": 1,
      "tasks": ["1.2", "1.4", "1.6", "1.8"]
    },
    {
      "id": 2,
      "tasks": ["3.1"]
    },
    {
      "id": 3,
      "tasks": ["3.2", "3.3"]
    },
    {
      "id": 4,
      "tasks": ["3.4", "3.5", "3.6"]
    },
    {
      "id": 5,
      "tasks": ["5.1"]
    },
    {
      "id": 6,
      "tasks": ["5.2", "5.3"]
    },
    {
      "id": 7,
      "tasks": ["5.4", "5.5", "5.6"]
    },
    {
      "id": 8,
      "tasks": ["5.7", "5.8", "5.10"]
    },
    {
      "id": 9,
      "tasks": ["5.9", "5.11"]
    },
    {
      "id": 10,
      "tasks": ["7.1"]
    },
    {
      "id": 11,
      "tasks": ["7.2", "7.3", "7.4"]
    },
    {
      "id": 12,
      "tasks": ["7.5", "7.6", "7.7"]
    },
    {
      "id": 13,
      "tasks": ["9.1", "9.2", "9.3", "9.4"]
    }
  ]
}
```
