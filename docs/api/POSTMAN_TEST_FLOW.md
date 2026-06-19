# Postman / Thunder Client Test Flow - P.A.R.C.E

**Generated**: June 9, 2026  
**Backend**: http://localhost:8000  
**Tools**: Postman, Thunder Client, cURL, HTTPie

---

## Setup

### Global Variables

Create these variables in Postman/Thunder Client:

```
base_url = http://localhost:8000
api_url = {{base_url}}/api
session_cookie = (auto-captured from Set-Cookie headers)
```

### Cookie Management

**CRITICAL**: Enable cookie management in your client

**Postman**: Cookies are automatically captured  
**Thunder Client**: Cookies are automatically captured  
**cURL**: Use `-c cookies.txt -b cookies.txt`

---

## Test Flow 1: Complete Customer Journey

### 1.1 Health Check

**Request**:
```
GET {{api_url}}/health
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "Application is running",
    "timestamp": "2026-06-09 12:00:00"
  }
}
```

**cURL**:
```bash
curl -X GET http://localhost:8000/api/health
```

---

### 1.2 Register New Customer

**Request**:
```
POST {{api_url}}/auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "customer@example.com",
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

**Set-Cookie Header** (auto-captured):
```
parce_session=abc123...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7200
```

**cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  }' \
  -c cookies.txt
```

---

### 1.3 Get Current User

**Request**:
```
GET {{api_url}}/auth/me
Cookie: parce_session={{session_cookie}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "accountStatus": "active",
    "lastLoginAt": "2026-06-09 12:00:00",
    "roles": ["customer"]
  },
  "message": "User retrieved successfully"
}
```

**cURL**:
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -b cookies.txt
```

---

### 1.4 Create Vehicle

**Request**:
```
POST {{api_url}}/vehicles
Content-Type: application/json
Cookie: parce_session={{session_cookie}}

{
  "license_plate": "ABC-1234",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Silver",
  "vehicle_type": "sedan",
  "fuel_type": "gasoline",
  "nickname": "My Camry",
  "is_primary": true
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": 1,
      "userId": 1,
      "licensePlate": "ABC-1234",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "color": "Silver",
      "vehicleType": "sedan",
      "fuelType": "gasoline",
      "nickname": "My Camry",
      "isPrimary": true,
      "status": "active",
      "createdAt": "2026-06-09 12:00:00",
      "updatedAt": "2026-06-09 12:00:00"
    }
  },
  "message": "Vehicle created successfully"
}
```

**cURL**:
```bash
curl -X POST http://localhost:8000/api/vehicles \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "license_plate": "ABC-1234",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "vehicle_type": "sedan",
    "fuel_type": "gasoline",
    "is_primary": true
  }'
```

---

### 1.5 List My Vehicles

**Request**:
```
GET {{api_url}}/vehicles
Cookie: parce_session={{session_cookie}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": 1,
        "licensePlate": "ABC-1234",
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "isPrimary": true,
        "status": "active"
      }
    ],
    "count": 1
  },
  "message": "Vehicles retrieved successfully"
}
```

---

### 1.6 Create Service Request

**Request**:
```
POST {{api_url}}/service-requests
Content-Type: application/json
Cookie: parce_session={{session_cookie}}

{
  "vehicle_id": 1,
  "emergency_type": "flat_tire",
  "description": "I have a flat tire on the highway, need immediate assistance",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "priority": "high"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "service_request": {
      "id": 1,
      "customerId": 1,
      "vehicleId": 1,
      "emergencyType": "flat_tire",
      "description": "I have a flat tire on the highway, need immediate assistance",
      "priority": "high",
      "status": "pending",
      "latitude": 40.7128,
      "longitude": -74.006,
      "createdAt": "2026-06-09 12:00:00"
    }
  },
  "message": "Service request created successfully"
}
```

**cURL**:
```bash
curl -X POST http://localhost:8000/api/service-requests \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "vehicle_id": 1,
    "emergency_type": "flat_tire",
    "description": "Flat tire on highway",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "priority": "high"
  }'
```

---

### 1.7 View My Service Requests

**Request**:
```
GET {{api_url}}/service-requests
Cookie: parce_session={{session_cookie}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "serviceRequests": [
      {
        "id": 1,
        "status": "pending",
        "emergencyType": "flat_tire",
        "priority": "high",
        "createdAt": "2026-06-09 12:00:00"
      }
    ],
    "count": 1
  },
  "message": "Service requests retrieved successfully"
}
```

---

### 1.8 Logout

**Request**:
```
POST {{api_url}}/auth/logout
Cookie: parce_session={{session_cookie}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Set-Cookie Header**:
```
parce_session=; Path=/; Max-Age=0
```

**cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt
```

---

## Test Flow 2: Complete Mechanic Journey

### 2.1 Register Mechanic

**Request**:
```
POST {{api_url}}/auth/register
Content-Type: application/json

{
  "email": "mechanic@example.com",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567891"
}
```

**Note**: After registration, manually assign 'mechanic' role via database:

```sql
INSERT INTO user_roles (user_id, role_id, assigned_at, is_active)
SELECT 
  (SELECT id FROM users WHERE email = 'mechanic@example.com'),
  (SELECT id FROM roles WHERE slug = 'mechanic'),
  NOW(),
  TRUE;
```

---

### 2.2 Login as Mechanic

**Request**:
```
POST {{api_url}}/auth/login
Content-Type: application/json

{
  "email": "mechanic@example.com",
  "password": "SecurePass123!",
  "remember": false
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "mechanic@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "roles": ["mechanic", "customer"]
    },
    "session": {
      "id": "xyz789...",
      "expiresAt": 1623456789
    }
  },
  "message": "Login successful"
}
```

---

### 2.3 View Available Requests

**Request**:
```
GET {{api_url}}/mechanic/requests/available?latitude=40.7128&longitude=-74.0060&radius=50
Cookie: parce_session={{mechanic_session}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "serviceRequests": [
      {
        "id": 1,
        "emergencyType": "flat_tire",
        "priority": "high",
        "status": "pending",
        "approximateLatitude": 40.71,
        "approximateLongitude": -74.01,
        "distance": 2.5,
        "createdAt": "2026-06-09 12:00:00"
      }
    ],
    "count": 1
  },
  "message": "Available service requests retrieved successfully"
}
```

**Note**: Exact coordinates hidden for 'pending' requests (privacy feature)

---

### 2.4 Accept Service Request

**Request**:
```
POST {{api_url}}/mechanic/requests/1/accept
Cookie: parce_session={{mechanic_session}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "service_request": {
      "id": 1,
      "status": "assigned",
      "mechanicId": 2,
      "latitude": 40.7128,
      "longitude": -74.006,
      "acceptedAt": "2026-06-09 12:05:00"
    }
  },
  "message": "Service request accepted successfully"
}
```

**Note**: Now exact coordinates are visible

---

### 2.5 Start Work

**Request**:
```
PUT {{api_url}}/mechanic/requests/1/start
Content-Type: application/json
Cookie: parce_session={{mechanic_session}}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "service_request": {
      "id": 1,
      "status": "in_progress",
      "startedAt": "2026-06-09 12:15:00"
    }
  },
  "message": "Service work started successfully"
}
```

---

### 2.6 Complete Service

**Request**:
```
PUT {{api_url}}/mechanic/requests/1/complete
Content-Type: application/json
Cookie: parce_session={{mechanic_session}}

{
  "final_cost": 75.50
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "service_request": {
      "id": 1,
      "status": "completed",
      "finalCost": 75.5,
      "completedAt": "2026-06-09 12:45:00"
    }
  },
  "message": "Service request completed successfully"
}
```

---

## Test Flow 3: RBAC Testing

### 3.1 Customer Tries to Access Mechanic Route (Should Fail)

**Request**:
```
GET {{api_url}}/mechanic/requests/available?latitude=40&longitude=-74
Cookie: parce_session={{customer_session}}
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "fields": {
    "requiredRoles": ["mechanic"],
    "userRoles": ["customer"]
  }
}
```

---

### 3.2 Mechanic Tries to Access Customer Route (Should Fail)

**Request**:
```
POST {{api_url}}/service-requests
Content-Type: application/json
Cookie: parce_session={{mechanic_session}}

{
  "vehicle_id": 1,
  "emergency_type": "flat_tire",
  "description": "test",
  "latitude": 40.7,
  "longitude": -74.0
}
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "fields": {
    "requiredRoles": ["customer"],
    "userRoles": ["mechanic"]
  }
}
```

---

## Test Flow 4: Error Cases

### 4.1 Invalid Login Credentials

**Request**:
```
POST {{api_url}}/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "WrongPassword123"
}
```

**Expected Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 4.2 Missing Authentication

**Request**:
```
GET {{api_url}}/vehicles
(No Cookie header)
```

**Expected Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

### 4.3 Validation Error

**Request**:
```
POST {{api_url}}/vehicles
Content-Type: application/json
Cookie: parce_session={{session_cookie}}

{
  "license_plate": "",
  "make": "",
  "year": 1800
}
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "licensePlate": "License plate is required",
    "make": "Make is required",
    "model": "Model is required",
    "year": "Year must be between 1900 and current year"
  }
}
```

---

### 4.4 Resource Not Found

**Request**:
```
GET {{api_url}}/vehicles/99999
Cookie: parce_session={{session_cookie}}
```

**Expected Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Vehicle not found"
}
```

---

### 4.5 Duplicate Email Registration

**Request**:
```
POST {{api_url}}/auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Expected Response** (409 Conflict):
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

## Test Flow 5: Rate Limiting

### 5.1 Trigger Rate Limit on Login

**Requests** (6 consecutive failed logins):
```
POST {{api_url}}/auth/login
(repeat 6 times with wrong password)
```

**6th Request Response** (429 Too Many Requests):
```json
{
  "success": false,
  "error": "Too many requests",
  "fields": {
    "retryAfter": 900
  }
}
```

**Response Header**:
```
Retry-After: 900
```

---

## Postman Collection Structure

```
P.A.R.C.E API Tests
├── Setup
│   └── Health Check
├── Authentication
│   ├── Register Customer
│   ├── Login Customer
│   ├── Get Current User
│   └── Logout
├── Vehicles
│   ├── Create Vehicle
│   ├── List Vehicles
│   ├── Get Vehicle
│   ├── Update Vehicle
│   ├── Delete Vehicle
│   └── Set Primary Vehicle
├── Service Requests - Customer
│   ├── Create Service Request
│   ├── List My Requests
│   ├── Get Request Details
│   ├── Update Request
│   ├── Cancel Request
│   └── Rate Request
├── Service Requests - Mechanic
│   ├── View Available Requests
│   ├── Accept Request
│   ├── Start Work
│   ├── Complete Service
│   └── List My Assignments
├── RBAC Tests
│   ├── Customer → Mechanic Route (403)
│   └── Mechanic → Customer Route (403)
├── Error Cases
│   ├── Invalid Login
│   ├── Missing Auth
│   ├── Validation Error
│   ├── Not Found
│   └── Duplicate Email
└── Rate Limiting
    └── Login Rate Limit
```

---

## Thunder Client Usage

### Import Collection

1. Copy all test cases above
2. Create new request in Thunder Client
3. Set environment variables:
   - `base_url`: http://localhost:8000
   - `api_url`: {{base_url}}/api

### Environment Setup

```json
{
  "base_url": "http://localhost:8000",
  "api_url": "{{base_url}}/api",
  "customer_email": "customer@example.com",
  "mechanic_email": "mechanic@example.com",
  "password": "SecurePass123!"
}
```

---

## HTTPie Examples

### Register
```bash
http POST :8000/api/auth/register \
  email=customer@example.com \
  password=SecurePass123! \
  first_name=John \
  last_name=Doe
```

### Login
```bash
http POST :8000/api/auth/login \
  email=customer@example.com \
  password=SecurePass123! \
  --session=customer
```

### List Vehicles
```bash
http GET :8000/api/vehicles --session=customer
```

---

## Quick Reference

### All Endpoints

| Method | Endpoint | Auth | RBAC |
|--------|----------|------|------|
| GET | `/api/health` | ❌ | ❌ |
| POST | `/api/auth/register` | ❌ | ❌ |
| POST | `/api/auth/login` | ❌ | ❌ |
| POST | `/api/auth/logout` | ✅ | ❌ |
| GET | `/api/auth/me` | ✅ | ❌ |
| GET | `/api/vehicles` | ✅ | ❌ |
| POST | `/api/vehicles` | ✅ | ❌ |
| GET | `/api/vehicles/{id}` | ✅ | ❌ |
| PUT | `/api/vehicles/{id}` | ✅ | ❌ |
| DELETE | `/api/vehicles/{id}` | ✅ | ❌ |
| PUT | `/api/vehicles/{id}/primary` | ✅ | ❌ |
| GET | `/api/service-requests` | ✅ | customer |
| POST | `/api/service-requests` | ✅ | customer |
| GET | `/api/service-requests/{id}` | ✅ | customer |
| PUT | `/api/service-requests/{id}` | ✅ | customer |
| POST | `/api/service-requests/{id}/cancel` | ✅ | customer |
| POST | `/api/service-requests/{id}/rate` | ✅ | customer |
| GET | `/api/mechanic/requests` | ✅ | mechanic |
| GET | `/api/mechanic/requests/available` | ✅ | mechanic |
| POST | `/api/mechanic/requests/{id}/accept` | ✅ | mechanic |
| PUT | `/api/mechanic/requests/{id}/start` | ✅ | mechanic |
| PUT | `/api/mechanic/requests/{id}/complete` | ✅ | mechanic |

---

**Created**: June 9, 2026  
**Version**: 1.0  
**Status**: Complete
