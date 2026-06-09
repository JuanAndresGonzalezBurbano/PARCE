# MVP User Flows - P.A.R.C.E

**Date**: June 9, 2026  
**Version**: MVP 1.0  
**Purpose**: Define complete user journeys for Customer and Mechanic roles

---

## Customer User Flows

### Flow 1: First-Time User Registration

**Entry Point**: Landing page or `/register`

```
1. User visits app
   ↓
2. Click "Sign Up" / "Register"
   → Navigate to /register
   ↓
3. Fill registration form
   - Email
   - Password
   - First Name
   - Last Name
   - Phone (optional)
   ↓
4. Submit form
   API: POST /api/auth/register
   ↓
5. Backend validates and creates user
   - Auto-assigns 'customer' role
   - Creates session
   - Returns user data + session cookie
   ↓
6. Frontend receives response
   - Stores user in AuthContext
   - Session cookie auto-stored
   ↓
7. Redirect to /dashboard
   → User is now logged in
```

**Success State**: User on dashboard, authenticated, ready to add vehicle

**Error Scenarios**:
- Email already exists → Show error "Email already registered"
- Validation fails → Show field-specific errors
- Network error → Show "Unable to connect. Try again"

---

### Flow 2: Returning User Login

**Entry Point**: `/login`

```
1. User visits /login
   ↓
2. Fill login form
   - Email
   - Password
   - Remember me (checkbox)
   ↓
3. Submit form
   API: POST /api/auth/login
   ↓
4. Backend validates credentials
   - Verifies password
   - Creates/updates session
   - Updates last_login_at
   ↓
5. Frontend receives response
   - Stores user in AuthContext
   - Session cookie auto-stored (2hr or 30 days)
   ↓
6. Check user roles
   ↓
7. Redirect based on role
   - If 'customer' → /dashboard
   - If 'mechanic' → /mechanic/dashboard
   - If both roles → Show role selector
```

**Success State**: User on appropriate dashboard

**Error Scenarios**:
- Wrong credentials → "Invalid email or password"
- Account suspended → "Your account is not active"
- Rate limited (6+ attempts) → "Too many attempts. Try again in 15 minutes"

---

### Flow 3: Add First Vehicle

**Entry Point**: `/dashboard` (empty vehicle state) or `/vehicles/new`

```
1. User on dashboard
   - Sees "No vehicles yet"
   - Clicks "Add Vehicle"
   ↓
2. Navigate to /vehicles/new
   ↓
3. Fill vehicle form
   - License Plate *
   - Make *
   - Model *
   - Year *
   - Color
   - VIN
   - Vehicle Type * (sedan/suv/truck/motorcycle/van/other)
   - Fuel Type * (gasoline/diesel/electric/hybrid)
   - Nickname
   - Set as primary (auto-checked if first vehicle)
   ↓
4. Submit form
   API: POST /api/vehicles
   ↓
5. Backend creates vehicle
   - Validates data
   - Associates with user
   - Sets as primary if first vehicle
   ↓
6. Frontend receives response
   - Add vehicle to local state
   - Show success toast
   ↓
7. Redirect to /vehicles
   → Vehicle now visible in list
```

**Success State**: Vehicle added, visible in list

**Error Scenarios**:
- Duplicate license plate → "License plate already registered"
- Validation fails → Show field-specific errors
- Year out of range → "Year must be between 1900 and 2026"

---

### Flow 4: Create Service Request

**Entry Point**: `/dashboard` or `/request/new`

```
1. User clicks "Request Service"
   ↓
2. Navigate to /request/new
   ↓
3. Select vehicle
   API: GET /api/vehicles (load user's vehicles)
   - Show dropdown of user's vehicles
   ↓
4. Request user's location
   - Use Geolocation API
   - Or manual address input
   ↓
5. Fill request form
   - Vehicle * (dropdown)
   - Emergency Type * (battery_dead/flat_tire/engine_failure/out_of_fuel/locked_keys/other)
   - Description *
   - Location * (latitude, longitude)
   - Priority (low/medium/high/urgent) - auto: 'medium'
   ↓
6. Submit form
   API: POST /api/service-requests
   ↓
7. Backend validates and creates request
   - Checks: only 1 active request per customer
   - Checks: only 1 active request per vehicle
   - Sets status: 'pending'
   ↓
8. Frontend receives response
   - Show success message
   - Display request ID
   ↓
9. Redirect to /requests/:id
   → Request tracking page
```

**Success State**: Request created, status 'pending', waiting for mechanic

**Error Scenarios**:
- Already has active request → "You already have an active request"
- Vehicle has active request → "This vehicle already has an active request"
- Location not provided → "Location is required"
- No vehicles → Prompt to add vehicle first

---

### Flow 5: Track Active Request

**Entry Point**: `/requests/:id` (from notification/dashboard)

```
1. User on /requests/:id
   ↓
2. Load request details
   API: GET /api/service-requests/:id
   (Poll every 10 seconds)
   ↓
3. Display based on status:

   STATUS: 'pending'
   - Show "Searching for mechanic..."
   - Show approximate wait time
   - Show request details
   - Show map with user location
   - Allow: Cancel request
   
   STATUS: 'assigned'
   - Show "Mechanic assigned!"
   - Show mechanic info (if available)
   - Show estimated arrival time
   - Show map with mechanic approaching
   - Allow: Cancel request (with warning)
   
   STATUS: 'in_progress'
   - Show "Mechanic working on your vehicle"
   - Show work started time
   - Show live updates (if any)
   - Cannot cancel
   
   STATUS: 'completed'
   - Show "Service completed!"
   - Show final cost
   - Show completion time
   - Prompt to rate service
   - Show receipt/summary
   
   STATUS: 'cancelled'
   - Show "Request cancelled"
   - Show cancellation reason
   - Show when cancelled
   - Option: Create new request
```

**Actions Available**:
- View details (always)
- Update description/location (only if 'pending')
- Cancel request (only if 'pending' or 'assigned')
- Rate service (only if 'completed' and not rated yet)
- View on map (always)

---

### Flow 6: Cancel Request

**Entry Point**: `/requests/:id` (Cancel button)

```
1. User clicks "Cancel Request"
   ↓
2. Show confirmation modal
   - "Are you sure you want to cancel?"
   - If 'assigned': Warn "Mechanic is already assigned"
   - Require cancellation reason
   ↓
3. User confirms and provides reason
   ↓
4. Submit cancellation
   API: POST /api/service-requests/:id/cancel
   Body: { cancellation_reason: "..." }
   ↓
5. Backend updates request
   - Sets status: 'cancelled'
   - Records cancellation_reason
   - Records cancelled_at timestamp
   ↓
6. Frontend receives response
   - Update request state
   - Show confirmation message
   ↓
7. Redirect to /dashboard
   → Request now shows as 'cancelled'
```

**Success State**: Request cancelled, user can create new request

---

### Flow 7: Rate Completed Service

**Entry Point**: `/requests/:id` (after completion)

```
1. User on completed request page
   - Sees "Rate this service" prompt
   ↓
2. Click "Rate Service"
   → Show rating modal
   ↓
3. Fill rating form
   - Star rating (1-5) *
   - Written feedback (optional)
   ↓
4. Submit rating
   API: POST /api/service-requests/:id/rate
   Body: { 
     customer_rating: 5, 
     customer_feedback: "Great service!" 
   }
   ↓
5. Backend updates request
   - Records rating
   - Records feedback
   - Marks as rated
   ↓
6. Frontend receives response
   - Show "Thank you for your feedback"
   - Hide rating prompt
   - Display submitted rating
```

**Success State**: Service rated, rating visible on request details

---

## Mechanic User Flows

### Flow 8: Mechanic Login

**Entry Point**: `/login`

```
1. Mechanic visits /login
   ↓
2. Fill credentials
   - Email
   - Password
   ↓
3. Submit form
   API: POST /api/auth/login
   ↓
4. Backend validates
   - Returns user with roles: ['mechanic', 'customer']
   ↓
5. Frontend checks roles
   - Detects 'mechanic' role
   ↓
6. Redirect to /mechanic/dashboard
   → Mechanic dashboard loaded
```

**Success State**: On mechanic dashboard

---

### Flow 9: View Available Requests

**Entry Point**: `/mechanic/dashboard` or `/mechanic/available`

```
1. Mechanic on dashboard
   - Clicks "View Available Requests"
   ↓
2. Navigate to /mechanic/available
   ↓
3. Request current location
   - Use Geolocation API
   - Or manual location input
   ↓
4. Load nearby requests
   API: GET /api/mechanic/requests/available
   Params: { latitude, longitude, radius: 50 }
   (Poll every 15 seconds)
   ↓
5. Display pending requests
   - Show list of 'pending' requests
   - Show approximate location (NOT exact coordinates)
   - Show emergency type
   - Show priority
   - Show distance from mechanic
   - Show time posted
   ↓
6. Mechanic browses list
   - Filter by distance
   - Filter by emergency type
   - Filter by priority
```

**Display**:
- Request card with limited info
- "Accept Request" button on each card
- Map showing approximate locations (privacy feature)

---

### Flow 10: Accept Service Request

**Entry Point**: `/mechanic/available` (Accept button)

```
1. Mechanic clicks "Accept Request"
   ↓
2. Show confirmation modal
   - Request details (limited)
   - Approximate location
   - Emergency type
   - "Are you sure?"
   ↓
3. Mechanic confirms
   ↓
4. Submit acceptance
   API: POST /api/mechanic/requests/:id/accept
   ↓
5. Backend validates and assigns
   - Checks: request still 'pending'
   - Checks: mechanic doesn't have active request
   - Sets status: 'assigned'
   - Sets mechanic_id
   - Records accepted_at timestamp
   - NOW: Exact coordinates visible
   ↓
6. Frontend receives response
   - Show success message
   - Now has full request details including exact location
   ↓
7. Redirect to /mechanic/requests/:id
   → Request details page with exact location
```

**Success State**: Request assigned to mechanic, can now see exact location

**Error Scenarios**:
- Request already assigned → "This request was already accepted by another mechanic"
- Mechanic has active request → "You already have an active request"

---

### Flow 11: Start Working on Request

**Entry Point**: `/mechanic/requests/:id` (assigned request)

```
1. Mechanic arrives at location
   ↓
2. On request details page
   - Shows customer info
   - Shows exact location (map)
   - Shows vehicle details
   - Shows emergency description
   ↓
3. Mechanic clicks "Start Work"
   ↓
4. Confirm modal
   - "Are you at the location?"
   ↓
5. Mechanic confirms
   ↓
6. Submit start
   API: PUT /api/mechanic/requests/:id/start
   ↓
7. Backend updates request
   - Sets status: 'in_progress'
   - Records started_at timestamp
   ↓
8. Frontend receives response
   - Update UI to "In Progress"
   - Show work timer
   - Show "Complete Service" button
```

**Success State**: Work in progress, timer running

---

### Flow 12: Complete Service Request

**Entry Point**: `/mechanic/requests/:id` (in_progress request)

```
1. Mechanic finishes work
   ↓
2. Clicks "Complete Service"
   ↓
3. Show completion form modal
   - Enter final cost * (required)
   - Add work notes (optional)
   ↓
4. Submit completion
   API: PUT /api/mechanic/requests/:id/complete
   Body: { final_cost: 75.50 }
   ↓
5. Backend updates request
   - Sets status: 'completed'
   - Records final_cost
   - Records completed_at timestamp
   - Calculates total work time
   ↓
6. Frontend receives response
   - Show "Service completed!"
   - Show completion summary
   - Show total cost
   - Show work duration
   ↓
7. Redirect to /mechanic/dashboard
   → Request now completed, ready for next
```

**Success State**: Service completed, mechanic can accept new requests

---

## Navigation Flow

### Customer Navigation

```
Landing
  ├─ /login
  ├─ /register
  └─ After Auth
       └─ /dashboard (main hub)
            ├─ /vehicles
            │    ├─ /vehicles/new
            │    └─ /vehicles/:id (view/edit)
            ├─ /requests
            │    ├─ /request/new
            │    └─ /requests/:id (track)
            └─ /profile (future)
```

### Mechanic Navigation

```
Landing
  ├─ /login
  └─ After Auth
       └─ /mechanic/dashboard (main hub)
            ├─ /mechanic/available (browse pending)
            └─ /mechanic/requests/:id (work on assigned)
```

---

## State Transitions

### Service Request Status Flow

```
Customer Creates Request
         ↓
    [pending] ────────────────────────┐
         ↓                             │
    Mechanic Accepts                   │ Customer Cancels
         ↓                             │
    [assigned] ───────────────────────┤
         ↓                             │
    Mechanic Starts                    │
         ↓                             │
    [in_progress]                      │
         ↓                             │
    Mechanic Completes                 │
         ↓                             │
    [completed] ───> Customer Rates    │
                                       ↓
                                  [cancelled]
```

**Valid Transitions**:
- `pending` → `assigned` (mechanic accepts)
- `pending` → `cancelled` (customer cancels)
- `assigned` → `in_progress` (mechanic starts)
- `assigned` → `cancelled` (customer cancels)
- `in_progress` → `completed` (mechanic completes)

**Invalid Transitions**:
- `in_progress` → `cancelled` (cannot cancel once work started)
- `completed` → any other status (terminal state)
- `cancelled` → any other status (terminal state)

---

## Error Handling Flows

### Network Error

```
User action
  ↓
API call fails (network error)
  ↓
Show error toast:
"Unable to connect. Check your internet connection."
  ↓
Option: Retry
```

### Authentication Error (401)

```
API call returns 401
  ↓
Session expired or invalid
  ↓
Clear user context
  ↓
Redirect to /login
  ↓
Show message:
"Your session has expired. Please login again."
```

### Authorization Error (403)

```
API call returns 403
  ↓
Insufficient permissions
  ↓
Show error:
"You don't have permission to perform this action."
  ↓
Stay on current page or redirect to appropriate dashboard
```

### Validation Error (400)

```
API call returns 400
  ↓
Validation failed
  ↓
Parse field errors from response
  ↓
Show errors under form fields
  ↓
Highlight invalid fields
  ↓
User can correct and resubmit
```

---

## Loading States

### Page Load
```
Show loading spinner or skeleton
↓
API call completes
↓
Show content
```

### Action in Progress
```
User clicks button (e.g., "Accept Request")
↓
Disable button
↓
Show loading indicator
↓
API call completes
↓
Re-enable button
↓
Show success/error message
```

### Polling Updates
```
Show "Live" indicator
↓
Poll API every N seconds
↓
Update data in background
↓
No loading spinner (seamless update)
```

---

## Notification Strategy (MVP)

**No push notifications** in MVP → Use:
1. **Polling** (as described above)
2. **Page refresh reminders** (every 5 minutes)
3. **Tab title updates** (e.g., "(1) New Request - P.A.R.C.E")

**Future Enhancement**: WebSocket for real-time notifications

---

## Offline Behavior

**Not supported in MVP**

**When offline**:
```
Detect offline (navigator.onLine === false)
↓
Show banner:
"You're offline. Some features may not work."
↓
Cache last known state (optional)
↓
When back online:
↓
Refresh data automatically
```

---

## MVP Constraints

### What's Included ✅
- Complete auth flow
- Vehicle management (CRUD)
- Service request creation (customer)
- Request tracking with status updates (polling)
- Request acceptance and completion (mechanic)
- Rating system
- Role-based access control

### What's NOT Included ❌
- Real-time notifications (use polling)
- Chat between customer and mechanic
- Payment processing
- Photo upload (vehicle photos, work photos)
- Admin panel
- Analytics dashboard
- Push notifications
- Offline support
- Advanced search/filtering

---

## Success Metrics (MVP)

**Customer Flow**:
- ✅ User can register and login
- ✅ User can add vehicle in < 2 minutes
- ✅ User can create service request in < 3 minutes
- ✅ User can track request status
- ✅ User can rate completed service

**Mechanic Flow**:
- ✅ Mechanic can login
- ✅ Mechanic can view available requests
- ✅ Mechanic can accept request in < 30 seconds
- ✅ Mechanic can complete service with cost entry

**System**:
- ✅ RBAC prevents unauthorized access
- ✅ Session management works correctly
- ✅ All transitions validated by backend

---

**Status**: ✅ Flows defined  
**Next**: Define frontend state structure and component architecture
