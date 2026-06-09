# Manual Testing Guide - P.A.R.C.E Backend

**Purpose**: Validate all backend functionality before frontend integration  
**Date**: June 9, 2026

---

## Prerequisites

1. **Server Running**: `php -S localhost:8000 -t public`
2. **Database**: MySQL/MariaDB running on port 3306
3. **Environment**: `.env` file configured
4. **Tool**: Use Postman, curl, or any HTTP client

---

## Test Environment Setup

### Base URL
```
http://localhost:8000
```

### Headers (for protected routes)
```
Content-Type: application/json
Cookie: parce_session=<session_id>
```

---

## TEST SUITE 1: Authentication Endpoints

### 1.1 Health Check (Public)
```http
GET /api/auth/health
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-06-09 12:00:00",
    "responseTime": 0.001
  },
  "message": "Service is healthy"
}
```

**✅ Pass Criteria**: Status 200, success: true

---

### 1.2 Register (Public)
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "testcustomer@test.com",
  "password": "TestPassword123!",
  "password_confirmation": "TestPassword123!",
  "first_name": "Test",
  "last_name": "Customer"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 18,
      "email": "testcustomer@test.com",
      "firstName": "Test",
      "lastName": "Customer",
      "accountStatus": "active"
    },
    "session": {
      "sessionId": "...",
      "expiresAt": "..."
    }
  },
  "message": "Registration successful"
}
```

**✅ Pass Criteria**: 
- Status 201
- success: true
- Cookie `parce_session` set
- User has customer role by default

**Save**: `session_id_customer` from cookie

---

### 1.3 Login (Public)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "testuser1@example.com",
  "password": "password123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "testuser1@example.com",
      ...
    },
    "session": {
      "sessionId": "...",
      ...
    }
  },
  "message": "Login successful"
}
```

**✅ Pass Criteria**: 
- Status 200
- success: true
- Cookie set
- User data returned

**Save**: `session_id_customer2` from cookie

---

### 1.4 Login as Mechanic
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "mechanic@parce.local",
  "password": "mechanic123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 12,
      "email": "mechanic@parce.local",
      ...
    }
  },
  "message": "Login successful"
}
```

**✅ Pass Criteria**: Status 200, Cookie set

**Save**: `session_id_mechanic` from cookie

---

### 1.5 Get Current User (Protected)
```http
GET /api/auth/me
Cookie: parce_session=<session_id_customer>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "testuser1@example.com",
    "firstName": "Test",
    "lastName": "User1",
    "accountStatus": "active",
    "roles": ["customer"],
    "primaryRole": "customer"
  },
  "message": "User retrieved successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- User data matches logged-in user
- Roles array present

---

### 1.6 Logout (Protected)
```http
POST /api/auth/logout
Cookie: parce_session=<session_id_customer>
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**✅ Pass Criteria**: 
- Status 200
- Cookie cleared (Max-Age=0)

---

## TEST SUITE 2: RBAC Validation

### 2.1 Customer Access Customer Route ✅
```http
GET /api/service-requests
Cookie: parce_session=<session_id_customer>
```

**Expected**: Status 200 (allowed)

**✅ Pass Criteria**: Customer CAN access customer routes

---

### 2.2 Customer Access Mechanic Route ❌
```http
GET /api/mechanic/requests
Cookie: parce_session=<session_id_customer>
```

**Expected Response** (403):
```json
{
  "success": false,
  "error": "Forbidden"
}
```

**✅ Pass Criteria**: 
- Status 403
- Customer CANNOT access mechanic routes

---

### 2.3 Mechanic Access Mechanic Route ✅
```http
GET /api/mechanic/requests?latitude=40.7128&longitude=-74.0060
Cookie: parce_session=<session_id_mechanic>
```

**Expected**: Status 200 (allowed)

**✅ Pass Criteria**: Mechanic CAN access mechanic routes

---

### 2.4 Mechanic Access Customer Route ❌
```http
POST /api/service-requests
Cookie: parce_session=<session_id_mechanic>
Content-Type: application/json

{
  "vehicle_id": 1,
  "emergency_type": "tire",
  "description": "Test",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Expected Response** (403):
```json
{
  "success": false,
  "error": "Forbidden"
}
```

**✅ Pass Criteria**: 
- Status 403
- Mechanic CANNOT access customer routes

---

## TEST SUITE 3: Vehicle Domain

### 3.1 List Customer Vehicles
```http
GET /api/vehicles
Cookie: parce_session=<session_id_customer>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": 1,
        "licensePlate": "ABC00101",
        "make": "Toyota",
        "model": "Corolla",
        "year": 2020,
        "isPrimary": 1,
        "status": "active"
      }
    ],
    "count": 2
  }
}
```

**✅ Pass Criteria**: 
- Status 200
- Only customer's vehicles returned
- Keys in camelCase

---

### 3.2 Create Vehicle
```http
POST /api/vehicles
Cookie: parce_session=<session_id_customer>
Content-Type: application/json

{
  "license_plate": "TEST123",
  "make": "Honda",
  "model": "Accord",
  "year": 2022,
  "color": "Blue",
  "vin": "1HGBH41JXMN123456",
  "vehicle_type": "sedan",
  "fuel_type": "gasoline"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": 7,
      "licensePlate": "TEST123",
      "make": "Honda",
      "model": "Accord",
      ...
    }
  },
  "message": "Vehicle created successfully"
}
```

**✅ Pass Criteria**: 
- Status 201
- Vehicle created
- userId matches authenticated user

**Save**: `vehicle_id_test` = 7

---

### 3.3 Get Vehicle by ID
```http
GET /api/vehicles/7
Cookie: parce_session=<session_id_customer>
```

**Expected**: Status 200, vehicle data

**✅ Pass Criteria**: Customer can view their own vehicle

---

### 3.4 Ownership Check - Cannot View Other's Vehicle
```http
GET /api/vehicles/3
Cookie: parce_session=<session_id_customer>
```
(Assuming vehicle 3 belongs to another user)

**Expected Response** (404):
```json
{
  "success": false,
  "error": "Vehicle not found"
}
```

**✅ Pass Criteria**: 
- Status 404
- Customer CANNOT view others' vehicles

---

### 3.5 Update Vehicle
```http
PUT /api/vehicles/7
Cookie: parce_session=<session_id_customer>
Content-Type: application/json

{
  "color": "Red",
  "nickname": "My Honda"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": 7,
      "color": "Red",
      "nickname": "My Honda",
      ...
    }
  },
  "message": "Vehicle updated successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- Vehicle updated
- Only specified fields changed

---

### 3.6 Set Vehicle as Primary
```http
PUT /api/vehicles/7/primary
Cookie: parce_session=<session_id_customer>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": 7,
      "isPrimary": 1,
      ...
    }
  },
  "message": "Vehicle set as primary successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- Vehicle is now primary
- Other vehicles isPrimary = 0

---

### 3.7 Delete Vehicle (Soft Delete)
```http
DELETE /api/vehicles/7
Cookie: parce_session=<session_id_customer>
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- Vehicle soft deleted (deleted_at set)
- Vehicle no longer appears in list

---

## TEST SUITE 4: Service Request Flow

### 4.1 List Customer Requests
```http
GET /api/service-requests
Cookie: parce_session=<session_id_customer>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "serviceRequests": [
      {
        "id": 1,
        "serviceCode": "SR-000001",
        "status": "pending",
        "emergencyType": "tire",
        ...
      }
    ],
    "count": 2
  }
}
```

**✅ Pass Criteria**: 
- Status 200
- Only customer's requests returned
- Keys in camelCase

---

### 4.2 Create Service Request (Customer)
```http
POST /api/service-requests
Cookie: parce_session=<session_id_customer>
Content-Type: application/json

{
  "vehicle_id": 1,
  "emergency_type": "battery",
  "description": "Car won't start, battery seems dead",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "priority": "urgent"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "data": {
    "serviceRequest": {
      "id": 5,
      "serviceCode": "SR-000005",
      "status": "pending",
      "emergencyType": "battery",
      "customerId": 1,
      "vehicleId": 1,
      ...
    }
  },
  "message": "Service request created successfully"
}
```

**✅ Pass Criteria**: 
- Status 201
- Request created with status 'pending'
- service_code generated

**Save**: `service_request_id` = 5

---

### 4.3 Get Service Request by ID
```http
GET /api/service-requests/5
Cookie: parce_session=<session_id_customer>
```

**Expected**: Status 200, request details

**✅ Pass Criteria**: 
- Status 200
- Full coordinates visible to customer (owner)

---

### 4.4 Mechanic Views Available Requests
```http
GET /api/mechanic/requests/available?latitude=40.7128&longitude=-74.0060&radius=50
Cookie: parce_session=<session_id_mechanic>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "serviceRequests": [
      {
        "id": 5,
        "serviceCode": "SR-000005",
        "status": "pending",
        "emergencyType": "battery",
        "latitude": 40.71,
        "longitude": -74.01,
        "distance": 2.5
      }
    ],
    "count": 1
  }
}
```

**✅ Pass Criteria**: 
- Status 200
- Pending requests visible
- Coordinates rounded (privacy)
- Distance calculated

---

### 4.5 Mechanic Accepts Request
```http
POST /api/mechanic/requests/5/accept
Cookie: parce_session=<session_id_mechanic>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "serviceRequest": {
      "id": 5,
      "status": "assigned",
      "mechanicId": 12,
      "assignedAt": "2026-06-09 12:30:00",
      ...
    }
  },
  "message": "Service request accepted successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- Status changes to 'assigned'
- mechanic_id set
- assigned_at timestamp set

---

### 4.6 Invalid Transition - Accept Already Assigned
```http
POST /api/mechanic/requests/5/accept
Cookie: parce_session=<another_mechanic_session>
```

**Expected Response** (400):
```json
{
  "success": false,
  "error": "Invalid status transition"
}
```

**✅ Pass Criteria**: 
- Status 400
- Cannot accept already assigned request

---

### 4.7 Mechanic Starts Service
```http
PUT /api/mechanic/requests/5/start
Cookie: parce_session=<session_id_mechanic>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "serviceRequest": {
      "id": 5,
      "status": "in_progress",
      "startedAt": "2026-06-09 12:45:00",
      ...
    }
  },
  "message": "Service work started successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- Status changes to 'in_progress'
- started_at timestamp set

---

### 4.8 Mechanic Completes Service
```http
PUT /api/mechanic/requests/5/complete
Cookie: parce_session=<session_id_mechanic>
Content-Type: application/json

{
  "final_cost": 150.00
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "serviceRequest": {
      "id": 5,
      "status": "completed",
      "completedAt": "2026-06-09 13:00:00",
      "finalCost": 150.00,
      ...
    }
  },
  "message": "Service request completed successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- Status changes to 'completed'
- completed_at timestamp set
- final_cost recorded

---

### 4.9 Customer Rates Completed Request
```http
POST /api/service-requests/5/rate
Cookie: parce_session=<session_id_customer>
Content-Type: application/json

{
  "customer_rating": 5,
  "customer_feedback": "Excellent service! Very professional."
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "serviceRequest": {
      "id": 5,
      "customerRating": 5,
      "customerFeedback": "Excellent service! Very professional.",
      ...
    }
  },
  "message": "Service request rated successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- Rating and feedback recorded

---

### 4.10 Customer Cancels Pending Request
```http
POST /api/service-requests/1/cancel
Cookie: parce_session=<session_id_customer>
Content-Type: application/json

{
  "cancellation_reason": "Found alternative solution"
}
```
(Assuming request 1 is still pending)

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "serviceRequest": {
      "id": 1,
      "status": "cancelled",
      "cancelledAt": "2026-06-09 13:15:00",
      "cancelledBy": 1,
      "cancellationReason": "Found alternative solution"
    }
  },
  "message": "Service request cancelled successfully"
}
```

**✅ Pass Criteria**: 
- Status 200
- Status changes to 'cancelled'
- Cancellation details recorded

---

### 4.11 Invalid Transition - Cancel Completed Request
```http
POST /api/service-requests/5/cancel
Cookie: parce_session=<session_id_customer>
Content-Type: application/json

{
  "cancellation_reason": "Test"
}
```

**Expected Response** (400):
```json
{
  "success": false,
  "error": "Invalid status transition"
}
```

**✅ Pass Criteria**: 
- Status 400
- Cannot cancel completed request (terminal state)

---

## TEST SUITE 5: Error Handling

### 5.1 Validation Error
```http
POST /api/service-requests
Cookie: parce_session=<session_id_customer>
Content-Type: application/json

{
  "vehicle_id": "invalid",
  "emergency_type": "unknown_type"
}
```

**Expected Response** (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "vehicleId": "Vehicle ID must be a number",
    "emergencyType": "Invalid emergency type",
    "description": "Description is required",
    "latitude": "Latitude is required",
    "longitude": "Longitude is required"
  }
}
```

**✅ Pass Criteria**: 
- Status 400
- Validation errors in fields object
- Keys in camelCase

---

### 5.2 Unauthorized - No Cookie
```http
GET /api/vehicles
```
(No cookie)

**Expected Response** (401):
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**✅ Pass Criteria**: 
- Status 401
- Clear error message

---

### 5.3 Not Found
```http
GET /api/vehicles/999999
Cookie: parce_session=<session_id_customer>
```

**Expected Response** (404):
```json
{
  "success": false,
  "error": "Vehicle not found"
}
```

**✅ Pass Criteria**: 
- Status 404
- Clear error message

---

## Validation Checklist

### ✅ Authentication
- [ ] Register creates user with customer role
- [ ] Login returns session cookie
- [ ] Me endpoint returns user data with roles
- [ ] Logout clears session

### ✅ RBAC
- [ ] Customer can access customer routes
- [ ] Customer CANNOT access mechanic routes
- [ ] Mechanic can access mechanic routes
- [ ] Mechanic CANNOT access customer routes

### ✅ Vehicle Domain
- [ ] List returns only user's vehicles
- [ ] Create vehicle works
- [ ] Update vehicle works
- [ ] Delete vehicle (soft delete) works
- [ ] Set primary vehicle works
- [ ] Ownership checks prevent access to others' vehicles

### ✅ Service Request Flow
- [ ] Customer can create request
- [ ] Request starts with 'pending' status
- [ ] Mechanic can view available requests
- [ ] Mechanic can accept request (pending → assigned)
- [ ] Mechanic can start request (assigned → in_progress)
- [ ] Mechanic can complete request (in_progress → completed)
- [ ] Customer can rate completed request
- [ ] Customer can cancel pending request
- [ ] Invalid transitions blocked

### ✅ Response Format
- [ ] All success responses have success: true
- [ ] All error responses have success: false
- [ ] Keys are in camelCase
- [ ] Status codes are correct
- [ ] Error messages are clear

### ✅ Headers
- [ ] Content-Type: application/json
- [ ] X-API-Version: 1.0.0
- [ ] Set-Cookie on auth endpoints

---

## Final Validation Report

After completing all tests, document:

1. **Tests Passed**: X / Total
2. **Critical Failures**: List any
3. **Warnings**: List any
4. **Backend Ready for Frontend**: YES / NO
5. **Blocking Issues**: List if any

---

## Notes

- Use fresh database state between test runs if needed
- Save session IDs for reuse across tests
- Verify terminal states are immutable
- Check ownership validations work correctly
- Confirm RBAC blocks unauthorized access
