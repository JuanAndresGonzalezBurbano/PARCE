# P.A.R.C.E API Endpoints - Summary

**Version**: 1.0.0  
**Total Endpoints**: 23  
**Date**: June 9, 2026

---

## Endpoint Summary Table

| # | Method | Endpoint | Auth | RBAC | Description |
|---|--------|----------|------|------|-------------|
| **HEALTH CHECKS** |
| 1 | GET | `/api/health` | ❌ | - | Basic health check |
| 2 | GET | `/api/health/database` | ❌ | - | Database health check |
| 3 | GET | `/api/health/system` | ❌ | - | System health check |
| **AUTHENTICATION** |
| 4 | GET | `/api/auth/health` | ❌ | - | Auth service health |
| 5 | POST | `/api/auth/register` | ❌ | - | Register new user |
| 6 | POST | `/api/auth/login` | ❌ | - | Login user |
| 7 | POST | `/api/auth/logout` | ✅ | - | Logout user |
| 8 | GET | `/api/auth/me` | ✅ | - | Get current user |
| **VEHICLES** |
| 9 | GET | `/api/vehicles` | ✅ | - | List user vehicles |
| 10 | POST | `/api/vehicles` | ✅ | - | Create vehicle |
| 11 | GET | `/api/vehicles/{id}` | ✅ | - | Get vehicle by ID |
| 12 | PUT | `/api/vehicles/{id}` | ✅ | - | Update vehicle |
| 13 | DELETE | `/api/vehicles/{id}` | ✅ | - | Delete vehicle (soft) |
| 14 | PUT | `/api/vehicles/{id}/primary` | ✅ | - | Set as primary vehicle |
| **SERVICE REQUESTS - CUSTOMER** |
| 15 | GET | `/api/service-requests` | ✅ | customer | List customer requests |
| 16 | POST | `/api/service-requests` | ✅ | customer | Create service request |
| 17 | GET | `/api/service-requests/{id}` | ✅ | customer | Get request by ID |
| 18 | PUT | `/api/service-requests/{id}` | ✅ | customer | Update request |
| 19 | POST | `/api/service-requests/{id}/cancel` | ✅ | customer | Cancel request |
| 20 | POST | `/api/service-requests/{id}/rate` | ✅ | customer | Rate completed request |
| **SERVICE REQUESTS - MECHANIC** |
| 21 | GET | `/api/mechanic/requests` | ✅ | mechanic | List mechanic requests |
| 22 | GET | `/api/mechanic/requests/available` | ✅ | mechanic | List available requests |
| 23 | POST | `/api/mechanic/requests/{id}/accept` | ✅ | mechanic | Accept request |
| 24 | PUT | `/api/mechanic/requests/{id}/start` | ✅ | mechanic | Start service |
| 25 | PUT | `/api/mechanic/requests/{id}/complete` | ✅ | mechanic | Complete service |

---

## Legend
- ✅ = Authentication Required
- ❌ = Public (No Auth)
- RBAC = Role-Based Access Control enforced

---

## Middleware Summary

### Public Endpoints (6)
No authentication required:
- Health checks (3)
- Register
- Login
- Auth health

### Protected Endpoints (19)
Require authentication (session cookie):
- Logout, Me (2)
- Vehicles (6)
- Service Requests - Customer (6)
- Service Requests - Mechanic (5)

### RBAC Enforced (11)
Role-specific access:
- Customer routes (6): Only users with 'customer' role
- Mechanic routes (5): Only users with 'mechanic' role

---

## Request/Response Format

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "fields": {
    "fieldName": "Field-specific error"
  }
}
```

### Key Naming Convention
- **Request**: snake_case (`first_name`, `vehicle_id`)
- **Response**: camelCase (`firstName`, `vehicleId`)

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized / wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Authentication Flow

1. **Register**: `POST /api/auth/register` → Returns session cookie
2. **Login**: `POST /api/auth/login` → Returns session cookie
3. **Use Cookie**: Include `parce_session` cookie in subsequent requests
4. **Logout**: `POST /api/auth/logout` → Clears session cookie

### Session Cookie Details
- **Name**: `parce_session`
- **HttpOnly**: true
- **Secure**: true (production)
- **SameSite**: Lax
- **Lifetime**: 2 hours (7200 seconds)
- **Remember Me**: 30 days (2592000 seconds)

---

## RBAC (Role-Based Access Control)

### Roles
1. **customer** - Can create/manage own service requests and vehicles
2. **mechanic** - Can view/accept/complete service requests
3. **administrator** - Admin access (not yet implemented)
4. **super_admin** - Full system access (not yet implemented)
5. **support** - Read-only access (not yet implemented)

### Role Hierarchy
```
super_admin > administrator > mechanic > customer > support
```

### Default Role
New users get **customer** role by default on registration.

---

## Data Models

### User
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "accountStatus": "active",
  "roles": ["customer"],
  "primaryRole": "customer"
}
```

### Vehicle
```json
{
  "id": 1,
  "userId": 1,
  "licensePlate": "ABC123",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "color": "Silver",
  "vin": "1HGBH41JXMN123456",
  "vehicleType": "sedan",
  "fuelType": "gasoline",
  "nickname": "My Car",
  "isPrimary": 1,
  "status": "active"
}
```

### Service Request
```json
{
  "id": 1,
  "serviceCode": "SR-000001",
  "customerId": 1,
  "vehicleId": 1,
  "mechanicId": null,
  "emergencyType": "tire",
  "description": "Flat tire on highway",
  "priority": "urgent",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "status": "pending",
  "requestedAt": "2026-06-09 12:00:00",
  "assignedAt": null,
  "startedAt": null,
  "completedAt": null,
  "cancelledAt": null,
  "finalCost": null,
  "customerRating": null,
  "customerFeedback": null
}
```

---

## Service Request Lifecycle

### Status Flow
```
pending → assigned → in_progress → completed
   ↓           ↓
cancelled   cancelled
```

### Valid Transitions
- `pending` → `assigned` (mechanic accepts)
- `pending` → `cancelled` (customer cancels)
- `assigned` → `in_progress` (mechanic starts)
- `assigned` → `cancelled` (customer cancels)
- `in_progress` → `completed` (mechanic completes)

### Terminal States
- `completed` - Cannot be changed
- `cancelled` - Cannot be changed
- `expired` - Cannot be changed (future feature)

---

## Emergency Types

Supported emergency types:
- `tire` - Flat tire / tire issues
- `battery` - Dead battery / electrical issues
- `fuel` - Out of fuel
- `lockout` - Keys locked inside
- `engine` - Engine problems
- `towing` - Vehicle needs towing
- `other` - Other emergencies

---

## Priority Levels

- `urgent` - Immediate attention required
- `normal` - Standard priority
- `low` - Can wait

---

## Vehicle Types

- `sedan`
- `suv`
- `truck`
- `van`
- `motorcycle`
- `other`

---

## Fuel Types

- `gasoline`
- `diesel`
- `electric`
- `hybrid`
- `other`

---

## Notes for Frontend Development

### Session Handling
- Cookie is HttpOnly - not accessible via JavaScript
- Browser automatically sends cookie with requests
- No need to manually handle tokens

### Error Handling
- Always check `success` field
- Display `error` message to user
- Show `fields` object for form validation errors

### Data Transformation
- Requests use snake_case
- Responses use camelCase
- Frontend should transform between conventions

### Pagination
- **NOT YET IMPLEMENTED**
- All list endpoints return full results
- Consider client-side pagination for now

### Filtering
- Limited filtering available via query params
- Example: `?status=pending`
- More advanced filtering not yet implemented

### Real-time Updates
- **NOT IMPLEMENTED**
- Use polling for now
- WebSockets/SSE planned for future

---

## Rate Limiting

### Status
- RateLimiter class exists
- **NOT YET APPLIED** to all routes
- Future implementation planned

### When Implemented
- 429 status code with `Retry-After` header
- Response includes `retryAfter` in seconds

---

## CORS Configuration

### Current Settings
- **Allowed Origins**: `*` (all origins - development only)
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With
- **Exposed Headers**: X-API-Version
- **Credentials**: true

### Production Recommendation
- Restrict `Allowed Origins` to specific domains
- Update in `.env`: `CORS_ALLOWED_ORIGINS=https://yourdomain.com`

---

## Missing Features (Future)

### Admin Endpoints
- User management
- System monitoring
- Reports

### Advanced Features
- Search/filtering
- Pagination
- Sorting
- Real-time notifications
- File uploads (mechanic photos)
- Payment integration
- Rating/review system enhancements

---

## Complete Details

For complete request/response examples for each endpoint, see:
- `MANUAL_TESTING_GUIDE.md` - Full testing guide with examples
- `API_DOCUMENTATION.md` - Original API documentation

---

**Document Version**: 1.0.0  
**Last Updated**: June 9, 2026
