# P.A.R.C.E API Documentation

**Version**: 1.0  
**Base URL**: `http://localhost:8000/api` (development)  
**Authentication**: Session-based (HTTP-only cookies)  
**Response Format**: JSON with camelCase fields  
**Generated**: June 9, 2026

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Vehicles](#2-vehicles)
3. [Service Requests - Customer](#3-service-requests---customer)
4. [Service Requests - Mechanic](#4-service-requests---mechanic)
5. [Health Checks](#5-health-checks)
6. [Common Patterns](#6-common-patterns)
7. [Error Responses](#7-error-responses)

---

## 1. Authentication

### 1.1 Register

Create a new user account.

**Endpoint**: `POST /api/auth/register`  
**Auth Required**: No  
**RBAC**: None

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "accountStatus": "active",
      "roles": ["customer"]
    },
    "session": {
      "id": "abc123...",
      "expiresAt": 1623456789
    }
  },
  "message": "Registration successful"
}
```


#### Error Responses

**409 Conflict** - Email already exists
```json
{
  "success": false,
  "error": "Email already exists"
}
```

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

---

### 1.2 Login

Authenticate existing user and create session.

**Endpoint**: `POST /api/auth/login`  
**Auth Required**: No  
**RBAC**: None

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "remember": false
}
```

**Fields**:
- `remember` (optional, boolean): If true, session expires in 30 days instead of 2 hours

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "accountStatus": "active",
      "lastLoginAt": "2026-06-09 10:30:00",
      "roles": ["customer"]
    },
    "session": {
      "id": "abc123...",
      "expiresAt": 1623456789
    }
  },
  "message": "Login successful"
}
```

