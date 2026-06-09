# Frontend API Mapping - P.A.R.C.E

**Date**: June 9, 2026  
**Backend Version**: 1.0 (FROZEN)  
**Purpose**: Map backend endpoints to frontend pages/components

---

## Base Configuration

### API URLs

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  API_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000,
  WITH_CREDENTIALS: true, // CRITICAL: Enable session cookies
};
```

### CORS Setup (Already Configured)

Backend `.env` already configured:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
CORS_ALLOW_CREDENTIALS=true
```

**Vite Default Port**: 5173 ✅ Already whitelisted  
**React CRA Port**: 3000 ✅ Already whitelisted

---

## Authentication Endpoints

### Page: `/login`

**Primary Endpoint**:
```typescript
POST /api/auth/login
Body: { email, password, remember }
Response: { success, data: { user, session } }
Cookie: parce_session (auto-set)
```

**Supporting Endpoints**:
```typescript
GET /api/auth/health
// Check if auth service is available
```

**State Updates**:
- Set user in AuthContext
- Redirect to role-based dashboard
- Session cookie auto-stored by browser

---

### Page: `/register`

**Primary Endpoint**:
```typescript
POST /api/auth/register
Body: { email, password, first_name, last_name, phone }
Response: { success, data: { user, session } }
Cookie: parce_session (auto-set)
```

**State Updates**:
- Set user in AuthContext
- Redirect to `/dashboard`
- Session cookie auto-stored by browser

---

### Component: `<AuthProvider>`

**Primary Endpoint**:
```typescript
GET /api/auth/me
Response: { success, data: { id, email, firstName, ... roles } }
```

**Usage**: Called on app mount to check if user is authenticated

**Primary Endpoint** (Logout):
```typescript
POST /api/auth/logout
Response: { success, message }
Cookie: parce_session (cleared)
```

---

## Customer Pages

### Page: `/dashboard` (Customer)

**Primary Endpoints**:
```typescript
// Get my vehicles (for quick access)
GET /api/vehicles
Response: { success, data: { vehicles, count } }

// Get my service requests (recent)
GET /api/service-requests
Response: { success, data: { serviceRequests, count } }
```

**Components**:
- `<VehiclesSummary />` → `/api/vehicles`
- `<RecentRequests />` → `/api/service-requests`
- `<CreateRequestButton />` → Navigate to `/request/new`

---

### Page: `/vehicles`

**Primary Endpoint**:
```typescript
GET /api/vehicles
Response: { success, data: { vehicles, count } }
```

**Components**:
- `<VehicleList />` → Display vehicles
- `<VehicleCard />` → Each vehicle
- `<AddVehicleButton />` → Navigate to `/vehicles/new`

---

### Page: `/vehicles/new`

**Primary Endpoint**:
```typescript
POST /api/vehicles
Body: { 
  license_plate, make, model, year,
  color, vehicle_type, fuel_type,
  nickname, is_primary
}
Response: { success, data: { vehicle } }
```

**State Updates**:
- Append new vehicle to vehicles list
- Redirect to `/vehicles`
- Show success toast

---

### Page: `/vehicles/:id`

**Primary Endpoints**:
```typescript
// Get vehicle details
GET /api/vehicles/:id
Response: { success, data: { vehicle } }

// Update vehicle
PUT /api/vehicles/:id
Body: { make, model, color, ... }
Response: { success, data: { vehicle } }

// Set as primary
PUT /api/vehicles/:id/primary
Response: { success, data: { vehicle } }

// Delete vehicle
DELETE /api/vehicles/:id
Response: { success, message }
```

**Components**:
- `<VehicleDetails />` → Display info
- `<VehicleEditForm />` → Edit mode
- `<DeleteVehicleButton />` → Confirm + delete

---

### Page: `/request/new`

**Primary Endpoint**:
```typescript
POST /api/service-requests
Body: {
  vehicle_id,
  emergency_type,
  description,
  latitude,
  longitude,
  priority
}
Response: { success, data: { service_request } }
```

**Dependencies**:
```typescript
// Load vehicles for selection
GET /api/vehicles
Response: { success, data: { vehicles } }
```

**State Updates**:
- Create new service request
- Redirect to `/requests/:id`
- Show success toast

---

### Page: `/requests`

**Primary Endpoint**:
```typescript
GET /api/service-requests
Response: { success, data: { serviceRequests, count } }
```

**Query Params** (optional):
```typescript
GET /api/service-requests?status=pending
GET /api/service-requests?status=completed
```

**Components**:
- `<RequestList />` → Display all requests
- `<RequestCard />` → Each request
- `<StatusFilter />` → Filter by status

---

### Page: `/requests/:id`

**Primary Endpoints**:
```typescript
// Get request details
GET /api/service-requests/:id
Response: { success, data: { service_request } }

// Update request (only if pending)
PUT /api/service-requests/:id
Body: { description, latitude, longitude, priority }
Response: { success, data: { service_request } }

// Cancel request
POST /api/service-requests/:id/cancel
Body: { cancellation_reason }
Response: { success, data: { service_request } }

// Rate request (only if completed)
POST /api/service-requests/:id/rate
Body: { customer_rating, customer_feedback }
Response: { success, data: { service_request } }
```

**Components**:
- `<RequestDetails />` → Display info
- `<RequestMap />` → Show location
- `<CancelButton />` → Cancel flow
- `<RatingForm />` → Rate completed service

---

## Mechanic Pages

### Page: `/mechanic/dashboard`

**Primary Endpoints**:
```typescript
// Get my assigned requests
GET /api/mechanic/requests
Response: { success, data: { serviceRequests, count } }

// Count available requests (nearby)
GET /api/mechanic/requests/available?latitude=X&longitude=Y&radius=50
Response: { success, data: { serviceRequests, count } }
```

**Components**:
- `<AssignedRequests />` → `/api/mechanic/requests`
- `<AvailableCount />` → `/api/mechanic/requests/available`

---

### Page: `/mechanic/available`

**Primary Endpoint**:
```typescript
GET /api/mechanic/requests/available?latitude=X&longitude=Y&radius=50
Response: { 
  success, 
  data: { 
    serviceRequests: [
      { id, emergencyType, priority, approximateLatitude, ... }
    ]
  } 
}
```

**Note**: Exact coordinates hidden until mechanic accepts

**Components**:
- `<AvailableRequestsList />` → Display pending requests
- `<RequestCard />` → Each request
- `<AcceptButton />` → Accept request

---

### Page: `/mechanic/requests/:id/accept`

**Primary Endpoint**:
```typescript
POST /api/mechanic/requests/:id/accept
Response: { success, data: { service_request } }
```

**State Updates**:
- Accept request
- Request status → 'assigned'
- Exact coordinates now visible
- Redirect to `/mechanic/requests/:id`

---

### Page: `/mechanic/requests/:id`

**Primary Endpoints**:
```typescript
// Get request details
GET /api/service-requests/:id
Response: { success, data: { service_request } }

// Start work
PUT /api/mechanic/requests/:id/start
Response: { success, data: { service_request } }

// Complete service
PUT /api/mechanic/requests/:id/complete
Body: { final_cost }
Response: { success, data: { service_request } }
```

**Components**:
- `<RequestDetails />` → Display info
- `<RequestMap />` → Show exact location
- `<StartButton />` → Start work
- `<CompleteForm />` → Complete service (with cost input)

---

## Health Check Endpoints

### Component: `<HealthChecker />` (Background)

**Primary Endpoints**:
```typescript
GET /api/health
Response: { success, data: { status, message } }

GET /api/health/database
Response: { success, data: { status, message, details } }
```

**Usage**: Check backend availability on app mount

---

## Complete Endpoint Map by Feature

### Authentication (Public)
| Endpoint | Method | Page/Component | Purpose |
|----------|--------|----------------|---------|
| `/api/auth/register` | POST | `/register` | Create account |
| `/api/auth/login` | POST | `/login` | Authenticate |
| `/api/auth/logout` | POST | `<AuthProvider>` | Logout |
| `/api/auth/me` | GET | `<AuthProvider>` | Check auth |
| `/api/auth/health` | GET | `<HealthChecker>` | Check service |

### Vehicles (Customer)
| Endpoint | Method | Page/Component | Purpose |
|----------|--------|----------------|---------|
| `/api/vehicles` | GET | `/vehicles`, `/dashboard` | List vehicles |
| `/api/vehicles` | POST | `/vehicles/new` | Create vehicle |
| `/api/vehicles/:id` | GET | `/vehicles/:id` | Get details |
| `/api/vehicles/:id` | PUT | `/vehicles/:id` | Update vehicle |
| `/api/vehicles/:id` | DELETE | `/vehicles/:id` | Delete vehicle |
| `/api/vehicles/:id/primary` | PUT | `/vehicles/:id` | Set primary |

### Service Requests (Customer)
| Endpoint | Method | Page/Component | Purpose |
|----------|--------|----------------|---------|
| `/api/service-requests` | GET | `/requests`, `/dashboard` | List requests |
| `/api/service-requests` | POST | `/request/new` | Create request |
| `/api/service-requests/:id` | GET | `/requests/:id` | Get details |
| `/api/service-requests/:id` | PUT | `/requests/:id` | Update request |
| `/api/service-requests/:id/cancel` | POST | `/requests/:id` | Cancel request |
| `/api/service-requests/:id/rate` | POST | `/requests/:id` | Rate service |

### Service Requests (Mechanic)
| Endpoint | Method | Page/Component | Purpose |
|----------|--------|----------------|---------|
| `/api/mechanic/requests` | GET | `/mechanic/dashboard` | My requests |
| `/api/mechanic/requests/available` | GET | `/mechanic/available` | Available requests |
| `/api/mechanic/requests/:id/accept` | POST | `/mechanic/available` | Accept request |
| `/api/mechanic/requests/:id/start` | PUT | `/mechanic/requests/:id` | Start work |
| `/api/mechanic/requests/:id/complete` | PUT | `/mechanic/requests/:id` | Complete service |

---

## API Client Structure

```typescript
// src/services/api.ts
export const api = {
  auth: {
    register: (data) => POST('/api/auth/register', data),
    login: (data) => POST('/api/auth/login', data),
    logout: () => POST('/api/auth/logout'),
    me: () => GET('/api/auth/me'),
  },
  
  vehicles: {
    list: () => GET('/api/vehicles'),
    create: (data) => POST('/api/vehicles', data),
    get: (id) => GET(`/api/vehicles/${id}`),
    update: (id, data) => PUT(`/api/vehicles/${id}`, data),
    delete: (id) => DELETE(`/api/vehicles/${id}`),
    setPrimary: (id) => PUT(`/api/vehicles/${id}/primary`),
  },
  
  requests: {
    list: (params) => GET('/api/service-requests', params),
    create: (data) => POST('/api/service-requests', data),
    get: (id) => GET(`/api/service-requests/${id}`),
    update: (id, data) => PUT(`/api/service-requests/${id}`, data),
    cancel: (id, reason) => POST(`/api/service-requests/${id}/cancel`, { cancellation_reason: reason }),
    rate: (id, rating, feedback) => POST(`/api/service-requests/${id}/rate`, { customer_rating: rating, customer_feedback: feedback }),
  },
  
  mechanic: {
    listRequests: (params) => GET('/api/mechanic/requests', params),
    available: (lat, lng, radius) => GET('/api/mechanic/requests/available', { latitude: lat, longitude: lng, radius }),
    accept: (id) => POST(`/api/mechanic/requests/${id}/accept`),
    start: (id) => PUT(`/api/mechanic/requests/${id}/start`),
    complete: (id, cost) => PUT(`/api/mechanic/requests/${id}/complete`, { final_cost: cost }),
  },
  
  health: {
    check: () => GET('/api/health'),
    database: () => GET('/api/health/database'),
  },
};
```

---

## Request/Response Patterns

### Standard Request Pattern

```typescript
// Request (snake_case)
{
  "first_name": "John",
  "last_name": "Doe",
  "emergency_type": "flat_tire"
}

// Response (camelCase - auto-converted)
{
  "success": true,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "emergencyType": "flat_tire"
  }
}
```

### Error Response Pattern

```typescript
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

## Authentication Flow

### Cookie Management (Automatic)

```typescript
// Browser automatically sends session cookie
fetch('http://localhost:8000/api/vehicles', {
  credentials: 'include', // CRITICAL
})

// Backend automatically validates cookie
// No need to manually manage session ID
```

### Session Expiration

**Default**: 2 hours  
**Remember Me**: 30 days

**Handling**:
```typescript
if (response.status === 401) {
  // Session expired or invalid
  clearUserContext();
  redirectTo('/login');
}
```

---

## Real-time Updates (Polling)

**No WebSocket available** → Use polling

```typescript
// Poll every 10 seconds for request status updates
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await api.requests.get(requestId);
    if (response.success) {
      setRequest(response.data.serviceRequest);
    }
  }, 10000); // 10 seconds

  return () => clearInterval(interval);
}, [requestId]);
```

**Recommended Polling Intervals**:
- Service request tracking: 10 seconds
- Available requests (mechanic): 15 seconds
- Dashboard summaries: 30 seconds

---

## Error Handling Strategy

### Global Error Handler

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>
): Promise<T | null> {
  try {
    const response = await apiCall();
    
    if (response.success) {
      return response.data;
    }
    
    // Handle error response
    if (response.fields) {
      // Validation errors
      showValidationErrors(response.fields);
    } else {
      // General error
      showErrorToast(response.error);
    }
    
    return null;
    
  } catch (error) {
    // Network error
    showErrorToast('Network error. Please try again.');
    return null;
  }
}
```

---

## Priority Endpoints for MVP

### Phase 1 (Week 1) - Authentication + Vehicles
1. ✅ `POST /api/auth/register`
2. ✅ `POST /api/auth/login`
3. ✅ `GET /api/auth/me`
4. ✅ `POST /api/auth/logout`
5. ✅ `GET /api/vehicles`
6. ✅ `POST /api/vehicles`
7. ✅ `GET /api/vehicles/:id`
8. ✅ `PUT /api/vehicles/:id`
9. ✅ `DELETE /api/vehicles/:id`

### Phase 2 (Week 2) - Customer Service Requests
10. ✅ `GET /api/service-requests`
11. ✅ `POST /api/service-requests`
12. ✅ `GET /api/service-requests/:id`
13. ✅ `PUT /api/service-requests/:id`
14. ✅ `POST /api/service-requests/:id/cancel`
15. ✅ `POST /api/service-requests/:id/rate`

### Phase 3 (Week 3) - Mechanic Features
16. ✅ `GET /api/mechanic/requests`
17. ✅ `GET /api/mechanic/requests/available`
18. ✅ `POST /api/mechanic/requests/:id/accept`
19. ✅ `PUT /api/mechanic/requests/:id/start`
20. ✅ `PUT /api/mechanic/requests/:id/complete`

**All 20 MVP endpoints ready** ✅

---

## Quick Reference

### Base URLs
```
Backend: http://localhost:8000
API: http://localhost:8000/api
Frontend (Vite): http://localhost:5173
```

### Authentication
```
Cookie Name: parce_session
Session Duration: 2 hours (default), 30 days (remember)
CORS: Already configured for localhost:5173
```

### Response Format
```
Success: { success: true, data: {...}, message?: "..." }
Error: { success: false, error: "...", fields?: {...} }
```

---

**Status**: ✅ All endpoints mapped  
**Backend**: FROZEN - No changes needed  
**Next**: Define frontend pages and state structure
