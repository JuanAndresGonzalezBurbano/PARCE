# Frontend State Structure - P.A.R.C.E

**Date**: June 9, 2026  
**Framework**: React + TypeScript  
**State Management**: Context API (MVP)  
**Backend**: Session-based (cookies)

---

## State Management Strategy

### Why Context API for MVP?

✅ **Simple**: No boilerplate, built-in to React  
✅ **Sufficient**: Handles auth, vehicles, requests  
✅ **Fast Setup**: No additional dependencies  
✅ **Type-safe**: Works well with TypeScript  

**Future**: Migrate to Redux Toolkit or Zustand if state becomes complex

---

## Global State Architecture

```
App
 └─ <AuthProvider>           // User authentication state
     └─ <VehicleProvider>    // User's vehicles
         └─ <RequestProvider> // Service requests
             └─ Routes       // App pages
```

---

## 1. Authentication State

### Context: `AuthContext`

**File**: `src/contexts/AuthContext.tsx`

**State**:
```typescript
interface AuthState {
  // User data
  user: User | null;
  
  // Loading states
  isLoading: boolean;
  isAuthenticating: boolean;
  
  // Error state
  error: string | null;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: 'active' | 'suspended' | 'deleted';
  lastLoginAt: string | null;
  roles: string[]; // ['customer'], ['mechanic'], or both
}
```

**Actions**:
```typescript
interface AuthActions {
  // Auth operations
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  
  // State management
  checkAuth: () => Promise<void>; // Called on app mount
  clearError: () => void;
}
```

**Usage**:
```typescript
const { user, isLoading, login, logout } = useAuth();

// Check if authenticated
if (user) {
  // User is logged in
}

// Check role
if (user?.roles.includes('mechanic')) {
  // User is mechanic
}
```

**Persistence**: Session cookie (managed by backend)

---

## 2. Vehicles State

### Context: `VehicleContext`

**File**: `src/contexts/VehicleContext.tsx`

**State**:
```typescript
interface VehicleState {
  // Vehicle list
  vehicles: Vehicle[];
  
  // Single vehicle (for detail view)
  currentVehicle: Vehicle | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Error state
  error: string | null;
}

interface Vehicle {
  id: number;
  userId: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  vin: string | null;
  vehicleType: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'other';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  nickname: string | null;
  isPrimary: boolean;
  status: 'active' | 'inactive';
  primaryPhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Actions**:
```typescript
interface VehicleActions {
  // CRUD operations
  fetchVehicles: () => Promise<void>;
  fetchVehicle: (id: number) => Promise<void>;
  createVehicle: (data: CreateVehicleData) => Promise<number | null>;
  updateVehicle: (id: number, data: UpdateVehicleData) => Promise<void>;
  deleteVehicle: (id: number) => Promise<void>;
  setPrimary: (id: number) => Promise<void>;
  
  // State management
  clearCurrentVehicle: () => void;
  clearError: () => void;
}
```

**Usage**:
```typescript
const { vehicles, isLoading, createVehicle } = useVehicles();

// List vehicles
<VehicleList vehicles={vehicles} />

// Create vehicle
await createVehicle({
  license_plate: 'ABC-123',
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  vehicle_type: 'sedan',
  fuel_type: 'gasoline',
});
```

**Cache**: Vehicles cached in context, refetched on mount

---

## 3. Service Requests State

### Context: `RequestContext`

**File**: `src/contexts/RequestContext.tsx`

**State**:
```typescript
interface RequestState {
  // Request lists
  customerRequests: ServiceRequest[];
  mechanicRequests: ServiceRequest[];
  availableRequests: ServiceRequest[];
  
  // Single request (for detail view)
  currentRequest: ServiceRequest | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Polling state
  isPolling: boolean;
  
  // Error state
  error: string | null;
}

interface ServiceRequest {
  id: number;
  customerId: number;
  vehicleId: number;
  mechanicId: number | null;
  emergencyType: 'battery_dead' | 'flat_tire' | 'engine_failure' | 'out_of_fuel' | 'locked_keys' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  latitude: number;
  longitude: number;
  approximateLatitude?: number; // Only for mechanics viewing pending requests
  approximateLongitude?: number;
  locationAddress: string | null;
  estimatedCost: number | null;
  finalCost: number | null;
  customerRating: number | null;
  customerFeedback: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}
```

**Actions**:
```typescript
interface RequestActions {
  // Customer actions
  fetchCustomerRequests: (status?: string) => Promise<void>;
  createRequest: (data: CreateRequestData) => Promise<number | null>;
  updateRequest: (id: number, data: UpdateRequestData) => Promise<void>;
  cancelRequest: (id: number, reason: string) => Promise<void>;
  rateRequest: (id: number, rating: number, feedback?: string) => Promise<void>;
  
  // Mechanic actions
  fetchMechanicRequests: (status?: string) => Promise<void>;
  fetchAvailableRequests: (lat: number, lng: number, radius?: number) => Promise<void>;
  acceptRequest: (id: number) => Promise<void>;
  startRequest: (id: number) => Promise<void>;
  completeRequest: (id: number, finalCost: number) => Promise<void>;
  
  // Detail view
  fetchRequest: (id: number) => Promise<void>;
  
  // Polling
  startPolling: (id: number, interval?: number) => void;
  stopPolling: () => void;
  
  // State management
  clearCurrentRequest: () => void;
  clearError: () => void;
}
```

**Usage**:
```typescript
const { 
  customerRequests, 
  isLoading, 
  createRequest,
  startPolling,
  stopPolling
} = useRequests();

// Create request
await createRequest({
  vehicle_id: 1,
  emergency_type: 'flat_tire',
  description: 'Flat tire on highway',
  latitude: 40.7128,
  longitude: -74.0060,
  priority: 'high',
});

// Start polling for updates (on request detail page)
useEffect(() => {
  startPolling(requestId, 10000); // Poll every 10 seconds
  return () => stopPolling();
}, [requestId]);
```

---

## 4. UI State (Local Component State)

Not in global context - managed by individual components

**Examples**:
```typescript
// Form states
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

// Modal states
const [showModal, setShowModal] = useState(false);
const [modalData, setModalData] = useState(null);

// Filter states (on list pages)
const [statusFilter, setStatusFilter] = useState('all');
const [sortBy, setSortBy] = useState('createdAt');
```

---

## 5. Location State (Geolocation)

### Hook: `useGeolocation`

**File**: `src/hooks/useGeolocation.ts`

**State**:
```typescript
interface GeolocationState {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}
```

**Actions**:
```typescript
interface GeolocationActions {
  getCurrentLocation: () => Promise<void>;
  clearError: () => void;
}
```

**Usage**:
```typescript
const { location, isLoading, getCurrentLocation } = useGeolocation();

// Request location
await getCurrentLocation();

if (location) {
  // Use location.latitude, location.longitude
}
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                    App Mount                        │
└──────────────────┬──────────────────────────────────┘
                   ↓
           ┌───────────────┐
           │ AuthProvider  │
           │ - checkAuth() │ ← Check if user is authenticated
           └───────┬───────┘
                   ↓
          ┌────────────────┐
    YES ← │ User logged in?│ → NO
          └────────────────┘    
            ↓                    ↓
   ┌────────────────┐    ┌──────────────┐
   │ Load Dashboard │    │ Show /login  │
   └────────┬───────┘    └──────────────┘
            ↓
   ┌────────────────────┐
   │  VehicleProvider   │
   │  - fetchVehicles() │ ← Load user's vehicles
   └────────┬───────────┘
            ↓
   ┌────────────────────┐
   │  RequestProvider   │
   │  - fetchRequests() │ ← Load user's requests
   └────────────────────┘
```

---

## Data Flow Patterns

### 1. Optimistic Updates

```typescript
// Example: Set vehicle as primary
async function setPrimary(id: number) {
  // 1. Optimistically update UI
  setVehicles(prev => prev.map(v => ({
    ...v,
    isPrimary: v.id === id
  })));
  
  try {
    // 2. Call API
    await api.vehicles.setPrimary(id);
    
  } catch (error) {
    // 3. Revert on error
    await fetchVehicles(); // Reload from server
    showError('Failed to set primary vehicle');
  }
}
```

### 2. Polling Pattern

```typescript
// Example: Poll request status
function startPolling(id: number, interval: number = 10000) {
  const pollInterval = setInterval(async () => {
    try {
      const response = await api.requests.get(id);
      if (response.success) {
        setCurrentRequest(response.data.serviceRequest);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, interval);
  
  // Store interval ID for cleanup
  setPollingInterval(pollInterval);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    setPollingInterval(null);
  }
}
```

### 3. Cache Invalidation

```typescript
// Example: After creating vehicle, invalidate cache
async function createVehicle(data) {
  const vehicleId = await api.vehicles.create(data);
  
  if (vehicleId) {
    // Invalidate cache by refetching
    await fetchVehicles();
  }
  
  return vehicleId;
}
```

---

## TypeScript Interfaces

### Centralized Types

**File**: `src/types/index.ts`

```typescript
// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: 'active' | 'suspended' | 'deleted';
  lastLoginAt: string | null;
  roles: string[];
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// Vehicle types
export interface Vehicle {
  id: number;
  userId: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  vin: string | null;
  vehicleType: VehicleType;
  fuelType: FuelType;
  nickname: string | null;
  isPrimary: boolean;
  status: 'active' | 'inactive';
  primaryPhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'other';
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';

export interface CreateVehicleData {
  license_plate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  vehicle_type: VehicleType;
  fuel_type: FuelType;
  nickname?: string;
  is_primary?: boolean;
}

// Service Request types
export interface ServiceRequest {
  id: number;
  customerId: number;
  vehicleId: number;
  mechanicId: number | null;
  emergencyType: EmergencyType;
  description: string;
  priority: Priority;
  status: RequestStatus;
  latitude: number;
  longitude: number;
  approximateLatitude?: number;
  approximateLongitude?: number;
  locationAddress: string | null;
  estimatedCost: number | null;
  finalCost: number | null;
  customerRating: number | null;
  customerFeedback: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export type EmergencyType = 'battery_dead' | 'flat_tire' | 'engine_failure' | 'out_of_fuel' | 'locked_keys' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type RequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';

export interface CreateRequestData {
  vehicle_id: number;
  emergency_type: EmergencyType;
  description: string;
  latitude: number;
  longitude: number;
  priority?: Priority;
}

// API Response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  fields?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

---

## Context Provider Setup

### App Root

**File**: `src/App.tsx`

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { VehicleProvider } from './contexts/VehicleContext';
import { RequestProvider } from './contexts/RequestContext';

function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <RequestProvider>
          <AppRoutes />
        </RequestProvider>
      </VehicleProvider>
    </AuthProvider>
  );
}
```

---

## Local Storage Strategy

**Minimal usage** - Session is cookie-based

**What to store**:
```typescript
// User preferences (theme, language, etc.)
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'en');

// Last known location (for quick access)
localStorage.setItem('lastLocation', JSON.stringify({ lat, lng }));

// Form drafts (for user convenience)
localStorage.setItem('requestDraft', JSON.stringify(formData));
```

**What NOT to store**:
- ❌ Session ID (handled by cookies)
- ❌ User credentials
- ❌ Sensitive user data
- ❌ API tokens

---

## Error State Management

### Global Error Handler

**File**: `src/utils/errorHandler.ts`

```typescript
export function handleApiError(error: ApiErrorResponse) {
  // Field-specific errors
  if (error.fields) {
    return {
      type: 'validation',
      message: error.error,
      fields: error.fields,
    };
  }
  
  // General error
  return {
    type: 'general',
    message: error.error,
  };
}

export function isAuthError(status: number): boolean {
  return status === 401;
}

export function isPermissionError(status: number): boolean {
  return status === 403;
}
```

---

## Loading State Best Practices

### Component-Level Loading

```typescript
function VehicleList() {
  const { vehicles, isLoading } = useVehicles();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return <div>{vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}</div>;
}
```

### Button-Level Loading

```typescript
function CreateVehicleButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function handleCreate() {
    setIsSubmitting(true);
    try {
      await createVehicle(data);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <button disabled={isSubmitting} onClick={handleCreate}>
      {isSubmitting ? 'Creating...' : 'Create Vehicle'}
    </button>
  );
}
```

---

## State Debugging

### Dev Tools Integration

```typescript
// src/contexts/AuthContext.tsx
if (process.env.NODE_ENV === 'development') {
  window.__AUTH_STATE__ = state;
}
```

**Usage**: Open browser console and type `window.__AUTH_STATE__`

---

## Performance Optimization

### Memoization

```typescript
// Memoize expensive computations
const activeRequests = useMemo(
  () => requests.filter(r => ['pending', 'assigned', 'in_progress'].includes(r.status)),
  [requests]
);

// Memoize callbacks
const handleCreate = useCallback(async (data) => {
  await createVehicle(data);
}, [createVehicle]);
```

### Avoid Unnecessary Re-renders

```typescript
// Split contexts to avoid re-rendering entire tree
<AuthProvider>        {/* Changes rarely */}
  <VehicleProvider>   {/* Changes on vehicle CRUD */}
    <RequestProvider> {/* Changes frequently (polling) */}
      <Routes />
    </RequestProvider>
  </VehicleProvider>
</AuthProvider>
```

---

## Summary

### State Distribution

| State | Where | Why |
|-------|-------|-----|
| User auth | AuthContext | Global, needed everywhere |
| Vehicles | VehicleContext | Global, shared across pages |
| Requests | RequestContext | Global, polling updates |
| Form data | Component | Local, temporary |
| UI state | Component | Local, page-specific |
| Geolocation | Hook | Reusable utility |

### API Calls

**All API calls** go through context providers  
**No direct API calls** from components  
**Benefits**: Centralized error handling, caching, state management

---

**Status**: ✅ State structure defined  
**Next**: Define component architecture and folder structure
