# P.A.R.C.E API - Test Checklist

**Purpose**: Manual testing checklist for all API endpoints  
**Date**: June 9, 2026

---

## TEST SUITE 1: HEALTH CHECKS

### 1.1 Basic Health Check
- [ ] GET `/api/health` returns 200
- [ ] Response has `success: true`
- [ ] Response includes timestamp

### 1.2 Database Health
- [ ] GET `/api/health/database` returns 200 when DB healthy
- [ ] Returns 503 when DB unavailable
- [ ] Includes connection details

### 1.3 System Health
- [ ] GET `/api/health/system` returns 200
- [ ] Shows all system components status
- [ ] Returns 503 if any component unhealthy

---

## TEST SUITE 2: AUTHENTICATION FLOW

### 2.1 Register
- [ ] POST `/api/auth/register` with valid data returns 201
- [ ] Session cookie is set
- [ ] User gets default 'customer' role
- [ ] Duplicate email returns 409 Conflict
- [ ] Missing fields return 400 with field errors
- [ ] Weak password rejected
- [ ] Password mismatch rejected

### 2.2 Login
- [ ] POST `/api/auth/login` with valid credentials returns 200
- [ ] Session cookie is set
- [ ] User data returned includes roles
- [ ] Invalid credentials return 401
- [ ] Remember me flag extends session
- [ ] Rate limiting applied (if enabled)

### 2.3 Get Current User
- [ ] GET `/api/auth/me` with valid session returns 200
- [ ] User data includes all roles
- [ ] Primary role identified correctly
- [ ] Without session cookie returns 401

### 2.4 Logout
- [ ] POST `/api/auth/logout` with valid session returns 200
- [ ] Session cookie cleared (Max-Age=0)
- [ ] Idempotent (works without session)

### 2.5 Session Expiration
- [ ] Session expires after 2 hours
- [ ] Expired session returns 401
- [ ] Session regenerates periodically for security

---

## TEST SUITE 3: RBAC VALIDATION

### 3.1 Customer Access
- [ ] Customer CAN access `/api/service-requests`
- [ ] Customer CAN create service request
- [ ] Customer CANNOT access `/api/mechanic/requests`
- [ ] Customer CANNOT accept requests
- [ ] Returns 403 Forbidden for mechanic routes

### 3.2 Mechanic Access
- [ ] Mechanic CAN access `/api/mechanic/requests`
- [ ] Mechanic CAN view available requests
- [ ] Mechanic CANNOT access `/api/service-requests` (customer POST)
- [ ] Mechanic CANNOT create service request as customer
- [ ] Returns 403 Forbidden for customer-only routes

### 3.3 Multiple Roles
- [ ] User with both customer and mechanic roles uses primary role
- [ ] Role hierarchy respected (super_admin > ... > support)

---

## TEST SUITE 4: VEHICLE MANAGEMENT

### 4.1 List Vehicles
- [ ] GET `/api/vehicles` returns only user's vehicles
- [ ] Response in camelCase
- [ ] Empty list returns 200 with empty array
- [ ] Includes vehicle count

### 4.2 Create Vehicle
- [ ] POST `/api/vehicles` with valid data returns 201
- [ ] Vehicle assigned to authenticated user
- [ ] Missing required fields return 400
- [ ] Duplicate license plate returns 409
- [ ] Invalid VIN format rejected

### 4.3 Get Vehicle by ID
- [ ] GET `/api/vehicles/{id}` returns 200 for own vehicle
- [ ] Returns 404 for other user's vehicle (ownership check)
- [ ] Returns 404 for non-existent ID

### 4.4 Update Vehicle
- [ ] PUT `/api/vehicles/{id}` updates own vehicle
- [ ] Only specified fields updated
- [ ] Cannot update other user's vehicle (returns 404)
- [ ] Invalid data rejected with 400

### 4.5 Delete Vehicle
- [ ] DELETE `/api/vehicles/{id}` soft deletes vehicle
- [ ] Vehicle no longer appears in list
- [ ] Cannot delete other user's vehicle
- [ ] deleted_at timestamp set in database

### 4.6 Set Primary Vehicle
- [ ] PUT `/api/vehicles/{id}/primary` sets vehicle as primary
- [ ] Previous primary vehicle becomes non-primary
- [ ] Only one primary vehicle per user
- [ ] Cannot set other user's vehicle as primary

---

## TEST SUITE 5: SERVICE REQUEST - CUSTOMER FLOW

### 5.1 List Customer Requests
- [ ] GET `/api/service-requests` returns only customer's requests
- [ ] Can filter by status: `?status=pending`
- [ ] Response includes request count
- [ ] Empty list handled correctly

### 5.2 Create Service Request
- [ ] POST `/api/service-requests` creates request
- [ ] Status is 'pending' initially
- [ ] Service code auto-generated
- [ ] Requires valid vehicle_id (ownership checked)
- [ ] Latitude/longitude required
- [ ] Emergency type validated
- [ ] Cannot create if customer has active request

### 5.3 Get Request by ID
- [ ] GET `/api/service-requests/{id}` returns own request
- [ ] Full coordinates visible to owner
- [ ] Cannot view other customer's request (404)

### 5.4 Update Request
- [ ] PUT `/api/service-requests/{id}` updates pending request
- [ ] Can update description, priority, coordinates
- [ ] Cannot update completed/cancelled request
- [ ] Cannot update other customer's request

### 5.5 Cancel Request
- [ ] POST `/api/service-requests/{id}/cancel` cancels pending request
- [ ] Can cancel assigned request
- [ ] Cannot cancel completed request (400)
- [ ] Cancellation reason required
- [ ] cancelled_at timestamp set

### 5.6 Rate Request
- [ ] POST `/api/service-requests/{id}/rate` rates completed request
- [ ] Rating 1-5 required
- [ ] Feedback optional
- [ ] Can only rate completed requests
- [ ] Can only rate own requests

---

## TEST SUITE 6: SERVICE REQUEST - MECHANIC FLOW

### 6.1 List Mechanic Requests
- [ ] GET `/api/mechanic/requests` returns assigned requests
- [ ] Can filter by status
- [ ] Only shows requests assigned to mechanic

### 6.2 List Available Requests
- [ ] GET `/api/mechanic/requests/available` requires latitude/longitude
- [ ] Returns pending requests within radius
- [ ] Coordinates are rounded (privacy)
- [ ] Distance calculated and included
- [ ] Default radius 50km

### 6.3 Accept Request
- [ ] POST `/api/mechanic/requests/{id}/accept` changes status to 'assigned'
- [ ] mechanic_id set to current mechanic
- [ ] assigned_at timestamp set
- [ ] Cannot accept already assigned request (400)
- [ ] Cannot accept completed request (400)

### 6.4 Start Service
- [ ] PUT `/api/mechanic/requests/{id}/start` changes status to 'in_progress'
- [ ] started_at timestamp set
- [ ] Can only start assigned request
- [ ] Can only start if mechanic is assigned
- [ ] Cannot start pending request (400)

### 6.5 Complete Service
- [ ] PUT `/api/mechanic/requests/{id}/complete` changes status to 'completed'
- [ ] final_cost required
- [ ] completed_at timestamp set
- [ ] Can only complete in_progress request
- [ ] Cannot complete if not assigned mechanic

---

## TEST SUITE 7: STATUS TRANSITIONS

### 7.1 Valid Transitions
- [ ] pending → assigned (mechanic accepts)
- [ ] assigned → in_progress (mechanic starts)
- [ ] in_progress → completed (mechanic completes)
- [ ] pending → cancelled (customer cancels)
- [ ] assigned → cancelled (customer cancels)

### 7.2 Invalid Transitions
- [ ] completed → any status (terminal state)
- [ ] cancelled → any status (terminal state)
- [ ] pending → in_progress (must be assigned first)
- [ ] assigned → completed (must start first)
- [ ] in_progress → pending (cannot go backward)

---

## TEST SUITE 8: OWNERSHIP VALIDATION

### 8.1 Vehicle Ownership
- [ ] Customer cannot view other's vehicles
- [ ] Customer cannot update other's vehicles
- [ ] Customer cannot delete other's vehicles
- [ ] Customer cannot use other's vehicle in service request

### 8.2 Service Request Ownership
- [ ] Customer cannot view other's requests
- [ ] Customer cannot cancel other's requests
- [ ] Customer cannot rate other's requests
- [ ] Mechanic cannot modify unassigned requests

---

## TEST SUITE 9: VALIDATION & ERROR HANDLING

### 9.1 Request Validation
- [ ] Missing required fields return 400
- [ ] Invalid data types rejected
- [ ] Invalid enum values rejected
- [ ] Field-specific errors returned in 'fields' object

### 9.2 Authentication Errors
- [ ] No session cookie returns 401
- [ ] Invalid session returns 401
- [ ] Expired session returns 401

### 9.3 Authorization Errors
- [ ] Wrong role returns 403
- [ ] Ownership violation returns 404
- [ ] Invalid state transition returns 400

### 9.4 Not Found Errors
- [ ] Non-existent ID returns 404
- [ ] Other user's resource returns 404 (privacy)

### 9.5 Conflict Errors
- [ ] Duplicate email returns 409
- [ ] Duplicate license plate returns 409
- [ ] Multiple active requests returns 409

---

## TEST SUITE 10: RESPONSE FORMAT

### 10.1 Success Responses
- [ ] All have `success: true`
- [ ] Data wrapped in `data` object
- [ ] Keys in camelCase
- [ ] Null fields omitted
- [ ] Message field optional

### 10.2 Error Responses
- [ ] All have `success: false`
- [ ] Error message in `error` field
- [ ] Validation errors in `fields` object
- [ ] Keys in camelCase

### 10.3 Headers
- [ ] Content-Type: application/json
- [ ] X-API-Version: 1.0.0
- [ ] CORS headers present

### 10.4 Status Codes
- [ ] 200 for successful GET/PUT/DELETE
- [ ] 201 for successful POST (create)
- [ ] 400 for validation errors
- [ ] 401 for authentication required
- [ ] 403 for forbidden (wrong role)
- [ ] 404 for not found
- [ ] 409 for conflicts
- [ ] 500 for server errors

---

## TEST SUITE 11: EDGE CASES

### 11.1 Empty Data
- [ ] Empty vehicle list handled
- [ ] Empty service request list handled
- [ ] Empty string fields rejected

### 11.2 Large Data
- [ ] Long descriptions accepted (within limits)
- [ ] Very long strings rejected
- [ ] SQL injection attempts blocked

### 11.3 Special Characters
- [ ] Names with special characters handled
- [ ] Email validation strict
- [ ] SQL injection characters escaped

### 11.4 Concurrency
- [ ] Two mechanics cannot accept same request
- [ ] Multiple requests processed correctly
- [ ] Session conflicts handled

---

## SUMMARY

**Total Test Cases**: ~150+

### Test Coverage
- [ ] All endpoints tested
- [ ] All RBAC rules validated
- [ ] All status transitions tested
- [ ] All ownership checks validated
- [ ] All error scenarios covered
- [ ] Response format consistent

### Pass Criteria
- All critical tests must pass
- No security vulnerabilities
- Consistent response format
- Proper error handling
- RBAC enforced correctly

---

**Checklist Version**: 1.0.0  
**Last Updated**: June 9, 2026
