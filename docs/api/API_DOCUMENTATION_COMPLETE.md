# P.A.R.C.E API Documentation - Complete Reference

**Version**: 1.0.0  
**Base URL**: `http://localhost:8000`  
**Date**: June 9, 2026

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Health Check Endpoints](#health-check-endpoints)
3. [Vehicle Endpoints](#vehicle-endpoints)
4. [Service Request Endpoints - Customer](#service-request-endpoints-customer)
5. [Service Request Endpoints - Mechanic](#service-request-endpoints-mechanic)
6. [Response Format Standards](#response-format-standards)
7. [Error Codes](#error-codes)
8. [Authentication](#authentication)

---

## Global Information

### Global Middleware
All requests pass through:
- `CORSMiddleware` - CORS headers
- `RequestLoggerMiddleware` - Request logging

### Headers
**Request Headers** (for protected routes):
```
Content-Type: application/json
Cookie: parce_session=<session_id>
```

**Response Headers**:
```
Content-Type: application/json; charset=utf-8
X-API-Version: 1.0.0
```

---

## Authentication Endpoints

### 1. Auth Health Check

**Endpoint**: `GET /api/auth/health`  
**Authentication**: None (Public)  
**RBAC**: None  
**Description**: Check authentication service health

**Request Body**: None

**Success Response** (200):
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

**Error Response** (503):
```json
{
  "success": false,
  "error": "Service is unhealthy",
  "fields": {
    "status": "unhealthy",
    "version": "1.0.0",
    "timestamp": "2026-06-09 12:00:00"
  }
}
```

---

### 2. Register

**Endpoint**: `POST /api/auth/register`  
**Authentication**: None (Public)  
**RBAC**: None  
**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```
