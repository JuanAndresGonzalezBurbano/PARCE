# P.A.R.C.E Authentication API Documentation

**Base URL:** `http://localhost:8000` (Development)  
**Version:** 1.0.0  
**Last Updated:** 2026-05-30

---

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Response Format](#response-format)
3. [Error Codes](#error-codes)
4. [Endpoints](#endpoints)
5. [Examples](#examples)

---

## Authentication Flow

### Registration → Login → Access Protected Routes → Logout

```
1. POST /api/auth/register
   ↓ (receives session cookie)
2. Access protected routes with cookie
3. POST /api/auth/logout
   ↓ (session invalidated)
```

### Session Management
- **Cookie Name:** `parce_session`
- **Lifetime:** 2 hours (7200 seconds)
- **Storage:** Database-backed
- **Attributes:** HttpOnly, SameSite=Lax

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

---

## Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error, malformed JSON |
| 401 | Unauthorized | Invalid credentials, missing/expired session |
| 409 | Conflict | Email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`  
**Authentication:** Not required  
**Description:** Check if the API is operational

#### Request
```http
GET /api/health HTTP/1.1
Host: localhost:8000
Accept: application/json
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "status": "healthy",
    "message": "Application is running",
    "timestamp": "2026-05-30 02:30:00"
  }
}
```

---

### 2. Register User

**Endpoint:** `POST /api/auth/register`  
**Authentication:** Not required  
**Description:** Register a new user account

#### Request Headers
```
Content-Type: application/json
Accept: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

#### Field Validation
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format, unique |
| password | string | Yes | Min 8 characters |
| password_confirmation | string | Yes | Must match password |
| first_name | string | Yes | Not empty |
| last_name | string | Yes | Not empty |
| phone | string | No | Valid phone format |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 13,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "accountStatus": "active",
      "roles": ["customer"]
    },
    "session": {
      "id": "5352a671215453621c7d4f0250b13bcf1608cd81",
      "expiresAt": 1780108128
    }
  },
  "message": "Registration successful"
}
```

**Set-Cookie Header:**
```
parce_session=5352a671215453621c7d4f0250b13bcf1608cd81; Path=/; HttpOnly; SameSite=Lax
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"],
    "password_confirmation": ["Password confirmation does not match"]
  }
}
```

**409 Conflict - Email Exists**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

### 3. Login

**Endpoint:** `POST /api/auth/login`  
**Authentication:** Not required  
**Description:** Authenticate user and create session  
**Rate Limit:** Configurable per IP

#### Request Headers
```
Content-Type: application/json
Accept: application/json
```

#### Request Body
```json
{
  "email": "customer@parce.local",
  "password": "Customer123!"
}
```

#### Field Validation
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Not empty |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 11,
      "email": "customer@parce.local",
      "firstName": "Demo",
      "lastName": "Customer",
      "accountStatus": "active",
      "lastLoginAt": "2026-05-30 02:30:00",
      "roles": ["customer"]
    },
    "session": {
      "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
      "expiresAt": 1780108200
    }
  },
  "message": "Login successful"
}
```

**Set-Cookie Header:**
```
parce_session=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0; Path=/; HttpOnly; SameSite=Lax
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "email": ["Email is required"],
    "password": ["Password is required"]
  }
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**429 Too Many Requests - Rate Limit**
```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```
**Response Headers:**
```
Retry-After: 60
```

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required  
**Description:** Get authenticated user information

#### Request Headers
```
Accept: application/json
Cookie: parce_session=<session_id>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 11,
    "email": "customer@parce.local",
    "firstName": "Demo",
    "lastName": "Customer",
    "accountStatus": "active",
    "lastLoginAt": "2026-05-30 02:30:00",
    "roles": ["customer"]
  },
  "message": "User retrieved successfully"
}
```

#### Error Responses

**401 Unauthorized - No Session**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**401 Unauthorized - Invalid Session**
```json
{
  "success": false,
  "error": "Invalid or expired session"
}
```

---

### 5. Logout

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Required  
**Description:** Invalidate current session

#### Request Headers
```
Accept: application/json
Cookie: parce_session=<session_id>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

**Set-Cookie Header (clears cookie):**
```
parce_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

## Examples

### JavaScript/Fetch Example

#### Register
```javascript
const response = await fetch('http://localhost:8000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!',
    password_confirmation: 'Password123!',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890'
  })
});

const data = await response.json();
console.log(data);
```

#### Login
```javascript
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'customer@parce.local',
    password: 'Customer123!'
  })
});

const data = await response.json();
console.log(data);
```

#### Get Current User
```javascript
const response = await fetch('http://localhost:8000/api/auth/me', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  },
  credentials: 'include' // Important: Include cookies
});

const data = await response.json();
console.log(data);
```

#### Logout
```javascript
const response = await fetch('http://localhost:8000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Accept': 'application/json'
  },
  credentials: 'include' // Important: Include cookies
});

const data = await response.json();
console.log(data);
```

---

### cURL Examples

#### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  }' \
  -c cookies.txt
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "customer@parce.local",
    "password": "Customer123!"
  }' \
  -c cookies.txt
```

#### Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Accept: application/json" \
  -b cookies.txt
```

#### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Accept: application/json" \
  -b cookies.txt
```

---

## CORS Configuration (Required for Frontend)

⚠️ **CORS middleware is not yet implemented.** Before frontend integration, you must:

1. Implement CORS middleware
2. Configure allowed origins
3. Set appropriate CORS headers

**Required Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept, Cookie
```

---

## Security Considerations

### For Frontend Developers

1. **Always use `credentials: 'include'`** in fetch requests to send cookies
2. **Never store session IDs in localStorage** - use HttpOnly cookies only
3. **Handle 401 responses** by redirecting to login page
4. **Handle 429 responses** by showing rate limit message
5. **Validate input on frontend** before sending to API
6. **Use HTTPS in production** to protect session cookies

### Session Management

- Sessions expire after 2 hours of inactivity
- Session cookie is HttpOnly (cannot be accessed by JavaScript)
- Session cookie has SameSite=Lax (CSRF protection)
- Sessions are stored in database (survives server restarts)

---

## Rate Limiting

### Login Endpoint
- **Limit:** Configurable per IP address
- **Response:** 429 Too Many Requests
- **Header:** `Retry-After: <seconds>`
- **Reset:** After specified time period

### Handling Rate Limits
```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  // Show user-friendly message
}
```

---

## Testing Credentials

### Admin Users
```
Email: superadmin@parce.local
Password: SuperAdmin123!
Role: Super Administrator

Email: admin@parce.local
Password: Admin123!
Role: Administrator
```

### Demo Users
```
Email: customer@parce.local
Password: Customer123!
Role: Customer

Email: mechanic@parce.local
Password: Mechanic123!
Role: Mechanic
```

⚠️ **These are development credentials only. Do not use in production.**

---

## Support

For issues or questions:
1. Check `BACKEND_VALIDATION_REPORT.md` for detailed validation results
2. See `QUICK_START_GUIDE.md` for setup instructions
3. Review inline code comments in source files

---

**Last Updated:** 2026-05-30  
**API Version:** 1.0.0  
**Status:** Production Ready (CORS configuration needed)
