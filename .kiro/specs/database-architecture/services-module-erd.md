# Services Module - Entity Relationship Diagram

## Overview
This document provides visual representations of the refactored Services module database architecture for the P.A.R.C.E platform.

---

## Complete Services Module ERD

```mermaid
erDiagram
    users ||--o{ services : "requests"
    users ||--o{ services : "assigned_to"
    users ||--o{ service_assignments : "assigned_to"
    users ||--o{ service_state_history : "changes"
    users ||--o{ services : "cancels"
    
    service_types ||--o{ services : "categorizes"
    service_statuses ||--o{ services : "current_status"
    service_statuses ||--o{ service_state_history : "previous_status"
    service_statuses ||--o{ service_state_history : "new_status"
    
    services ||--o{ service_assignments : "has"
    services ||--o{ service_state_history : "tracks"
    services ||--o{ service_locations : "tracks_location"
    
    users {
        bigint id PK
        varchar full_name
        varchar email
        varchar phone
        timestamp created_at
    }
    
    service_types {
        int id PK
        varchar name UK
        varchar category
        text description
        decimal base_price
        int estimated_duration_minutes
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    service_statuses {
        int id PK
        varchar name UK
        text description
        int sort_order
        boolean is_terminal
        boolean is_cancellable
        varchar color_code
        timestamp created_at
        timestamp updated_at
    }
    
    services {
        bigint id PK
        bigint user_id FK
        bigint mechanic_id FK
        int service_type_id FK
        int status_id FK
        decimal latitude
        decimal longitude
        varchar address_text
        text description
        text user_notes
        text mechanic_notes
        decimal quoted_price
        decimal final_price
        timestamp requested_at
        timestamp assigned_at
        timestamp accepted_at
        timestamp arrived_at
        timestamp started_at
        timestamp completed_at
        timestamp cancelled_at
        timestamp rejected_at
        timestamp expired_at
        text cancellation_reason
        bigint cancelled_by FK
        text rejection_reason
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    service_assignments {
        bigint id PK
        bigint service_id FK
        bigint mechanic_id FK
        timestamp assigned_at
        timestamp responded_at
        timestamp expires_at
        enum status
        text rejection_reason
        int response_time_seconds
        int assignment_order
        bigint assigned_by FK
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    service_state_history {
        bigint id PK
        bigint service_id FK
        int previous_status_id FK
        int new_status_id FK
        bigint changed_by FK
        varchar actor_role
        int transition_duration_seconds
        text notes
        json metadata
        timestamp created_at
    }
    
    service_locations {
        bigint id PK
        bigint service_id FK
        decimal latitude
        decimal longitude
        decimal accuracy
        decimal speed
        decimal heading
        timestamp recorded_at
        timestamp created_at
    }
```

---

## Service Lifecycle Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> requested: Customer creates request
    
    requested --> accepted: Mechanic accepts
    requested --> rejected: Mechanic rejects
    requested --> expired: No response timeout
    requested --> cancelled: Customer cancels
    
    accepted --> mechanic_en_route: Mechanic starts travel
    accepted --> cancelled: Customer cancels
    
    mechanic_en_route --> arrived: Mechanic arrives
    mechanic_en_route --> cancelled: Customer cancels
    
    arrived --> in_progress: Service starts
    arrived --> cancelled: Customer cancels
    
    in_progress --> completed: Service finished
    
    completed --> [*]
    cancelled --> [*]
    rejected --> [*]
    expired --> [*]
    
    note right of requested
        Initial state
        Awaiting assignment
    end note
    
    note right of accepted
        Mechanic committed
        Can still cancel
    end note
    
    note right of in_progress
        Active service
        Cannot cancel
    end note
    
    note right of completed
        Terminal state
        Analytics recorded
    end note
```

---

## Service Assignment Flow Diagram

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant M1 as Mechanic 1
    participant M2 as Mechanic 2
    participant DB as Database
    
    C->>S: Create service request
    S->>DB: INSERT services (status=requested)
    S->>DB: INSERT service_state_history
    
    S->>M1: Assign service (Assignment #1)
    S->>DB: INSERT service_assignments (pending)
    S->>DB: UPDATE services (mechanic_id, assigned_at)
    
    alt Mechanic accepts
        M1->>S: Accept assignment
        S->>DB: UPDATE service_assignments (status=accepted)
        S->>DB: UPDATE services (status=accepted, accepted_at)
        S->>DB: INSERT service_state_history
        S->>C: Notify: Mechanic accepted
    else Mechanic rejects
        M1->>S: Reject assignment
        S->>DB: UPDATE service_assignments (status=rejected)
        S->>M2: Reassign to Mechanic 2 (Assignment #2)
        S->>DB: INSERT service_assignments (pending, order=2)
        S->>DB: UPDATE services (mechanic_id=M2)
        M2->>S: Accept assignment
        S->>DB: UPDATE service_assignments (status=accepted)
        S->>DB: UPDATE services (status=accepted)
        S->>C: Notify: New mechanic assigned
    else Assignment expires
        S->>DB: UPDATE service_assignments (status=expired)
        S->>M2: Reassign to Mechanic 2
        S->>DB: INSERT service_assignments (pending, order=2)
    end
```

---

## State History Tracking Pattern

```mermaid
graph TD
    A[Service Created] -->|INSERT| B[services table]
    B -->|status_id=requested| C[Initial State]
    
    C -->|Status Change| D[Trigger: sp_record_state_transition]
    
    D -->|1. Get previous status| E[Query current status_id]
    D -->|2. Calculate duration| F[TIMESTAMPDIFF from last change]
    D -->|3. Insert history| G[service_state_history]
    D -->|4. Update service| H[UPDATE services.status_id]
    
    G -->|Records| I[previous_status_id]
    G -->|Records| J[new_status_id]
    G -->|Records| K[changed_by]
    G -->|Records| L[transition_duration_seconds]
    G -->|Records| M[actor_role]
    G -->|Records| N[notes]
    
    H -->|Triggers| O[trg_services_status_timestamps]
    O -->|Updates| P[Lifecycle timestamps]
    
    P -->|Examples| Q[accepted_at]
    P -->|Examples| R[arrived_at]
    P -->|Examples| S[started_at]
    P -->|Examples| T[completed_at]
```

---

## Assignment Tracking Architecture

```mermaid
graph LR
    A[Service Request] --> B{Assignment System}
    
    B -->|Create| C[service_assignments record]
    
    C --> D[assignment_order: 1]
    C --> E[status: pending]
    C --> F[expires_at: +30min]
    
    D --> G{Mechanic Response}
    
    G -->|Accept| H[status: accepted]
    G -->|Reject| I[status: rejected]
    G -->|Timeout| J[status: expired]
    
    H --> K[responded_at recorded]
    H --> L[response_time_seconds calculated]
    H --> M[Service proceeds]
    
    I --> N[rejection_reason stored]
    I --> O[Reassignment triggered]
    
    J --> P[System reassigns]
    
    O --> Q[New assignment created]
    P --> Q
    
    Q --> R[assignment_order: 2]
    R --> G
    
    style H fill:#90EE90
    style I fill:#FFB6C1
    style J fill:#FFD700
```

---

## Analytics Query Patterns

### Response Time Calculation
```mermaid
graph TD
    A[services table] --> B[requested_at]
    A --> C[assigned_at]
    A --> D[accepted_at]
    A --> E[arrived_at]
    A --> F[started_at]
    A --> G[completed_at]
    
    B --> H[Assignment Time]
    C --> H
    
    C --> I[Acceptance Time]
    D --> I
    
    D --> J[Travel Time]
    E --> J
    
    E --> K[Preparation Time]
    F --> K
    
    F --> L[Service Duration]
    G --> L
    
    B --> M[Total Time]
    G --> M
    
    H --> N[v_service_response_metrics VIEW]
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Analytics Dashboard]
```

### Mechanic Performance Tracking
```mermaid
graph TD
    A[service_assignments] --> B[Count by status]
    A --> C[response_time_seconds]
    
    D[services] --> E[Count by status_id]
    D --> F[Travel time calculation]
    D --> G[Service duration calculation]
    
    B --> H[Acceptance Rate]
    B --> I[Rejection Rate]
    
    C --> J[Avg Response Time]
    
    E --> K[Completion Rate]
    E --> L[Cancellation Rate]
    
    F --> M[Avg Travel Time]
    G --> N[Avg Service Duration]
    
    H --> O[v_mechanic_performance VIEW]
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
    
    O --> P[Mechanic Dashboard]
    O --> Q[Admin Analytics]
```

---

## Relationship Cardinalities

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| users → services (customer) | 1:N | One customer can request many services |
| users → services (mechanic) | 1:N | One mechanic can be assigned to many services |
| service_types → services | 1:N | One service type can have many service requests |
| service_statuses → services | 1:N | One status can be current for many services |
| services → service_assignments | 1:N | One service can have multiple assignment attempts |
| services → service_state_history | 1:N | One service has many state transitions |
| services → service_locations | 1:N | One service has many GPS tracking points |
| users → service_assignments | 1:N | One mechanic can have many assignments |
| users → service_state_history | 1:N | One user can trigger many state changes |

---

## Key Improvements Over Original Design

### 1. **Comprehensive Lifecycle Timestamps**
- **Before**: Only `scheduled_at`, `started_at`, `completed_at`
- **After**: Added `requested_at`, `assigned_at`, `accepted_at`, `arrived_at`, `cancelled_at`, `rejected_at`, `expired_at`
- **Benefit**: Complete visibility into every stage of service lifecycle

### 2. **Dedicated Assignment System**
- **Before**: Assignment tracked only in `services.mechanic_id`
- **After**: Separate `service_assignments` table with full history
- **Benefit**: Supports reassignment, rejection tracking, and mechanic performance analytics

### 3. **Enhanced State History**
- **Before**: Basic state tracking with `state_id` and `changed_by`
- **After**: Added `previous_status_id`, `transition_duration_seconds`, `actor_role`, `metadata`
- **Benefit**: Complete audit trail with transition analytics

### 4. **Robust Status Architecture**
- **Before**: 7 basic states
- **After**: 9 states with `is_terminal`, `is_cancellable`, `color_code` flags
- **Benefit**: Better business logic support and UI integration

### 5. **Analytics-Ready Design**
- **Before**: Limited indexing for analytics
- **After**: Composite indexes, pre-built views, stored procedures
- **Benefit**: Fast analytics queries without impacting transactional performance

### 6. **Normalized Service Types**
- **Before**: Basic service type catalog
- **After**: Added `category` and `estimated_duration_minutes`
- **Benefit**: Better grouping and scheduling capabilities

---

## Index Strategy

### Primary Indexes (Single Column)
- `services`: user_id, mechanic_id, service_type_id, status_id, requested_at
- `service_assignments`: service_id, mechanic_id, status, assigned_at
- `service_state_history`: service_id, new_status_id, created_at

### Composite Indexes (Analytics)
- `services`: (status_id, requested_at), (mechanic_id, status_id, requested_at)
- `service_assignments`: (mechanic_id, status, assigned_at), (service_id, assignment_order)
- `service_state_history`: (service_id, created_at), (previous_status_id, new_status_id, created_at)

### Spatial Indexes
- `services`: (latitude, longitude)
- `service_locations`: (latitude, longitude)

---

## Constraints Summary

### Foreign Key Constraints
- All relationships properly enforced with appropriate ON DELETE actions
- CASCADE for dependent data (assignments, history, locations)
- RESTRICT for reference data (service_types, service_statuses)
- SET NULL for optional relationships (mechanic_id when mechanic deleted)

### Check Constraints
- Latitude: BETWEEN -90 AND 90
- Longitude: BETWEEN -180 AND 180
- Prices: >= 0 (non-negative)
- GPS accuracy: >= 0
- GPS heading: BETWEEN 0 AND 360

### Unique Constraints
- `service_types.name`: Prevents duplicate service type names
- `service_statuses.name`: Prevents duplicate status names
- `service_assignments`: (service_id, status, mechanic_id) for pending assignments

---

## Trigger Automation

### 1. Status Timestamp Trigger
**Purpose**: Automatically set lifecycle timestamps when status changes
**Trigger**: `trg_services_status_timestamps`
**Logic**: 
- When status changes to 'accepted' → Set `accepted_at`
- When status changes to 'arrived' → Set `arrived_at`
- When status changes to 'in_progress' → Set `started_at`
- When status changes to 'completed' → Set `completed_at`
- When status changes to 'cancelled' → Set `cancelled_at`

### 2. Response Time Trigger
**Purpose**: Calculate mechanic response time automatically
**Trigger**: `trg_assignment_response_time`
**Logic**: When `responded_at` is set, calculate `response_time_seconds` as difference from `assigned_at`

---

## Stored Procedures

### 1. sp_assign_service_to_mechanic
**Purpose**: Assign or reassign a service to a mechanic
**Parameters**:
- `p_service_id`: Service to assign
- `p_mechanic_id`: Mechanic to assign to
- `p_assigned_by`: User creating the assignment
- `p_expires_minutes`: Minutes until assignment expires
- `p_assignment_id` (OUT): ID of created assignment

**Logic**:
1. Calculate assignment order (1, 2, 3, etc.)
2. Calculate expiration timestamp
3. Create assignment record
4. Update service with mechanic_id and assigned_at

### 2. sp_record_state_transition
**Purpose**: Record a state change with full audit trail
**Parameters**:
- `p_service_id`: Service being updated
- `p_new_status_id`: New status
- `p_changed_by`: User making the change
- `p_actor_role`: Role of the user (customer, mechanic, admin, system)
- `p_notes`: Optional notes about the change

**Logic**:
1. Get current status from services table
2. Get timestamp of last state change
3. Calculate duration in previous state
4. Insert state history record
5. Update service status

---

## Migration Path from Original Design

### Step 1: Add New Columns to services
```sql
ALTER TABLE services
ADD COLUMN requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER deleted_at,
ADD COLUMN assigned_at TIMESTAMP NULL AFTER requested_at,
ADD COLUMN accepted_at TIMESTAMP NULL AFTER assigned_at,
ADD COLUMN arrived_at TIMESTAMP NULL AFTER accepted_at,
ADD COLUMN cancelled_at TIMESTAMP NULL AFTER completed_at,
ADD COLUMN rejected_at TIMESTAMP NULL AFTER cancelled_at,
ADD COLUMN expired_at TIMESTAMP NULL AFTER rejected_at,
ADD COLUMN cancellation_reason TEXT NULL AFTER expired_at,
ADD COLUMN cancelled_by BIGINT UNSIGNED NULL AFTER cancellation_reason,
ADD COLUMN rejection_reason TEXT NULL AFTER cancelled_by,
ADD COLUMN quoted_price DECIMAL(10, 2) NULL AFTER mechanic_notes,
ADD COLUMN final_price DECIMAL(10, 2) NULL AFTER quoted_price,
ADD COLUMN address_text VARCHAR(255) NULL AFTER longitude;
```

### Step 2: Rename service_states to service_statuses
```sql
RENAME TABLE service_states TO service_statuses;
ALTER TABLE services CHANGE current_state_id status_id INT UNSIGNED NOT NULL;
ALTER TABLE service_state_history CHANGE state_id new_status_id INT UNSIGNED NOT NULL;
```

### Step 3: Add New Columns to service_statuses
```sql
ALTER TABLE service_statuses
ADD COLUMN is_terminal BOOLEAN NOT NULL DEFAULT FALSE AFTER sort_order,
ADD COLUMN is_cancellable BOOLEAN NOT NULL DEFAULT TRUE AFTER is_terminal,
ADD COLUMN color_code VARCHAR(7) DEFAULT '#6B7280' AFTER is_cancellable;
```

### Step 4: Create service_assignments Table
```sql
-- Use the CREATE TABLE statement from services-module-refactored.sql
```

### Step 5: Add New Columns to service_state_history
```sql
ALTER TABLE service_state_history
ADD COLUMN previous_status_id INT UNSIGNED NULL AFTER service_id,
ADD COLUMN actor_role VARCHAR(50) NULL AFTER changed_by,
ADD COLUMN transition_duration_seconds INT UNSIGNED NULL AFTER actor_role,
ADD COLUMN metadata JSON NULL AFTER notes;
```

### Step 6: Add New Statuses
```sql
INSERT INTO service_statuses (name, description, sort_order, is_terminal, is_cancellable, color_code) VALUES
('requested', 'Service request created, awaiting mechanic assignment', 1, FALSE, TRUE, '#3B82F6'),
('accepted', 'Mechanic accepted the service request', 2, FALSE, TRUE, '#10B981'),
('rejected', 'Service request rejected by mechanic', 8, TRUE, FALSE, '#EF4444'),
('expired', 'Service request expired without assignment', 9, TRUE, FALSE, '#DC2626');
```

### Step 7: Create Indexes
```sql
-- Use the CREATE INDEX statements from services-module-refactored.sql
```

### Step 8: Create Views, Procedures, and Triggers
```sql
-- Use the CREATE VIEW, CREATE PROCEDURE, and CREATE TRIGGER statements
```

---

## End of ERD Documentation
