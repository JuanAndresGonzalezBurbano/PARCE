<?php

namespace App\Infrastructure\ServiceRequest;

use App\Core\Database;
use App\Infrastructure\ServiceRequest\ServiceRequestValidator;

/**
 * Service Request Service
 * 
 * Business logic for service request management including creation, updates,
 * status transitions, mechanic assignment, and customer rating.
 * 
 * Business Rules:
 * - One active request per customer
 * - One active request per vehicle
 * - Active statuses: pending, assigned, in_progress
 * - Terminal statuses: completed, cancelled, expired
 * - Location privacy: exact coordinates hidden during pending, visible after assignment
 */
class ServiceRequestService
{
    /**
     * Create a new service request
     * 
     * @param int $customerId Customer user ID
     * @param array $data Service request data
     * @return int Created service request ID
     * @throws \Exception On database or business logic error
     */
    public function create(int $customerId, array $data): int
    {
        // Verify vehicle exists and customer owns it
        $vehicle = Database::fetchOne(
            'SELECT id, user_id, status FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [(int)$data['vehicle_id']]
        );
        
        if ($vehicle === null) {
            throw new \Exception('Vehicle not found');
        }
        
        if ((int)$vehicle['user_id'] !== $customerId) {
            throw new \Exception('You do not own this vehicle');
        }
        
        if ($vehicle['status'] !== 'active') {
            throw new \Exception('Vehicle is not active');
        }
        
        // Check for active requests by this customer
        $activeCustomerRequest = Database::fetchOne(
            'SELECT id, service_code FROM service_requests 
             WHERE customer_id = ? 
             AND status IN (?, ?, ?) 
             AND deleted_at IS NULL',
            [$customerId, 'pending', 'assigned', 'in_progress']
        );
        
        if ($activeCustomerRequest !== null) {
            throw new \Exception(
                'You already have an active service request (' . 
                $activeCustomerRequest['service_code'] . 
                '). Please complete or cancel it before creating a new one.'
            );
        }
        
        // Check for active requests for this vehicle
        $activeVehicleRequest = Database::fetchOne(
            'SELECT id, service_code FROM service_requests 
             WHERE vehicle_id = ? 
             AND status IN (?, ?, ?) 
             AND deleted_at IS NULL',
            [(int)$data['vehicle_id'], 'pending', 'assigned', 'in_progress']
        );
        
        if ($activeVehicleRequest !== null) {
            throw new \Exception(
                'This vehicle already has an active service request (' . 
                $activeVehicleRequest['service_code'] . 
                '). Please complete or cancel it before creating a new one.'
            );
        }
        
        // Prepare insert data
        $insertData = [
            'customer_id' => $customerId,
            'vehicle_id' => (int)$data['vehicle_id'],
            'emergency_type' => strtolower($data['emergency_type']),
            'description' => $data['description'],
            'latitude' => (float)$data['latitude'],
            'longitude' => (float)$data['longitude'],
            'priority' => strtolower($data['priority'] ?? 'normal'),
            'status' => 'pending',
            'requested_at' => date('Y-m-d H:i:s')
        ];
        
        // Insert service request
        $requestId = Database::insert('service_requests', $insertData);
        
        // Generate and update service code
        $serviceCode = ServiceRequestValidator::generateServiceCode($requestId);
        Database::update('service_requests', [
            'service_code' => $serviceCode
        ], 'id = ?', [$requestId]);
        
        return $requestId;
    }
    
    /**
     * Update a pending service request (customer only)
     * 
     * @param int $requestId Service request ID
     * @param int $customerId Customer user ID
     * @param array $data Update data
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function update(int $requestId, int $customerId, array $data): bool
    {
        // Verify request exists and customer owns it
        $request = Database::fetchOne(
            'SELECT id, customer_id, status FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$requestId]
        );
        
        if ($request === null) {
            throw new \Exception('Service request not found');
        }
        
        if ((int)$request['customer_id'] !== $customerId) {
            throw new \Exception('You do not own this service request');
        }
        
        // Only pending requests can be updated by customers
        if ($request['status'] !== 'pending') {
            throw new \Exception('Only pending requests can be updated');
        }
        
        // Prepare update data
        $updateData = [];
        
        if (isset($data['description'])) {
            $updateData['description'] = $data['description'];
        }
        
        if (isset($data['latitude'])) {
            $updateData['latitude'] = (float)$data['latitude'];
        }
        
        if (isset($data['longitude'])) {
            $updateData['longitude'] = (float)$data['longitude'];
        }
        
        if (isset($data['priority'])) {
            $updateData['priority'] = strtolower($data['priority']);
        }
        
        // If nothing to update
        if (empty($updateData)) {
            return true;
        }
        
        // Update service request
        $rowCount = Database::update('service_requests', $updateData, 'id = ?', [$requestId]);
        
        return $rowCount > 0;
    }
    
    /**
     * Cancel a service request
     * 
     * @param int $requestId Service request ID
     * @param int $userId User ID (customer or admin)
     * @param string $reason Cancellation reason
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function cancel(int $requestId, int $userId, string $reason): bool
    {
        // Verify request exists
        $request = Database::fetchOne(
            'SELECT id, customer_id, status FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$requestId]
        );
        
        if ($request === null) {
            throw new \Exception('Service request not found');
        }
        
        // Verify ownership
        if ((int)$request['customer_id'] !== $userId) {
            throw new \Exception('You do not own this service request');
        }
        
        // Can only cancel pending or assigned requests
        if (!in_array($request['status'], ['pending', 'assigned'], true)) {
            throw new \Exception('Only pending or assigned requests can be cancelled');
        }
        
        // Update to cancelled status
        $rowCount = Database::update('service_requests', [
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_by' => $userId,
            'cancelled_at' => date('Y-m-d H:i:s')
        ], 'id = ?', [$requestId]);
        
        return $rowCount > 0;
    }
    
    /**
     * Mechanic accepts a pending request (self-assignment)
     * 
     * @param int $requestId Service request ID
     * @param int $mechanicId Mechanic user ID
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function accept(int $requestId, int $mechanicId): bool
    {
        // Verify request exists and is pending
        $request = Database::fetchOne(
            'SELECT id, status FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$requestId]
        );
        
        if ($request === null) {
            throw new \Exception('Service request not found');
        }
        
        if ($request['status'] !== 'pending') {
            throw new \Exception('Only pending requests can be accepted');
        }
        
        // Validate status transition
        $validation = ServiceRequestValidator::validateStatusTransition($request['status'], 'assigned');
        if (!$validation['valid']) {
            throw new \Exception($validation['error']);
        }
        
        // Update to assigned status
        $rowCount = Database::update('service_requests', [
            'status' => 'assigned',
            'mechanic_id' => $mechanicId,
            'assigned_at' => date('Y-m-d H:i:s')
        ], 'id = ?', [$requestId]);
        
        return $rowCount > 0;
    }
    
    /**
     * Mechanic starts work on an assigned request
     * 
     * @param int $requestId Service request ID
     * @param int $mechanicId Mechanic user ID
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function start(int $requestId, int $mechanicId): bool
    {
        // Verify request exists and mechanic is assigned
        $request = Database::fetchOne(
            'SELECT id, status, mechanic_id FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$requestId]
        );
        
        if ($request === null) {
            throw new \Exception('Service request not found');
        }
        
        if ((int)$request['mechanic_id'] !== $mechanicId) {
            throw new \Exception('You are not assigned to this service request');
        }
        
        if ($request['status'] !== 'assigned') {
            throw new \Exception('Only assigned requests can be started');
        }
        
        // Validate status transition
        $validation = ServiceRequestValidator::validateStatusTransition($request['status'], 'in_progress');
        if (!$validation['valid']) {
            throw new \Exception($validation['error']);
        }
        
        // Update to in_progress status
        $rowCount = Database::update('service_requests', [
            'status' => 'in_progress',
            'started_at' => date('Y-m-d H:i:s')
        ], 'id = ?', [$requestId]);
        
        return $rowCount > 0;
    }
    
    /**
     * Mechanic completes a service request
     * 
     * @param int $requestId Service request ID
     * @param int $mechanicId Mechanic user ID
     * @param float $finalCost Final service cost
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function complete(int $requestId, int $mechanicId, float $finalCost): bool
    {
        // Verify request exists and mechanic is assigned
        $request = Database::fetchOne(
            'SELECT id, status, mechanic_id FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$requestId]
        );
        
        if ($request === null) {
            throw new \Exception('Service request not found');
        }
        
        if ((int)$request['mechanic_id'] !== $mechanicId) {
            throw new \Exception('You are not assigned to this service request');
        }
        
        if ($request['status'] !== 'in_progress') {
            throw new \Exception('Only in-progress requests can be completed');
        }
        
        // Validate status transition
        $validation = ServiceRequestValidator::validateStatusTransition($request['status'], 'completed');
        if (!$validation['valid']) {
            throw new \Exception($validation['error']);
        }
        
        // Validate final cost
        if ($finalCost < 0) {
            throw new \Exception('Final cost must be a positive number');
        }
        
        // Update to completed status
        $rowCount = Database::update('service_requests', [
            'status' => 'completed',
            'final_cost' => $finalCost,
            'resolved_by' => $mechanicId,
            'completed_at' => date('Y-m-d H:i:s')
        ], 'id = ?', [$requestId]);
        
        return $rowCount > 0;
    }
    
    /**
     * Customer rates a completed service request
     * 
     * @param int $requestId Service request ID
     * @param int $customerId Customer user ID
     * @param int $rating Rating (1-5)
     * @param string|null $feedback Optional feedback
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function rate(int $requestId, int $customerId, int $rating, ?string $feedback = null): bool
    {
        // Verify request exists and customer owns it
        $request = Database::fetchOne(
            'SELECT id, customer_id, status, customer_rating FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$requestId]
        );
        
        if ($request === null) {
            throw new \Exception('Service request not found');
        }
        
        if ((int)$request['customer_id'] !== $customerId) {
            throw new \Exception('You do not own this service request');
        }
        
        // Can only rate completed requests
        if ($request['status'] !== 'completed') {
            throw new \Exception('Only completed requests can be rated');
        }
        
        // Check if already rated
        if ($request['customer_rating'] !== null) {
            throw new \Exception('This service request has already been rated');
        }
        
        // Update rating
        $updateData = ['customer_rating' => $rating];
        
        if ($feedback !== null) {
            $updateData['customer_feedback'] = $feedback;
        }
        
        $rowCount = Database::update('service_requests', $updateData, 'id = ?', [$requestId]);
        
        return $rowCount > 0;
    }
    
    /**
     * Get service request by ID
     * 
     * @param int $requestId Service request ID
     * @param int $userId User ID (for ownership/access check)
     * @param string $userRole User role (customer, mechanic, admin)
     * @return array|null Service request data with privacy filtering
     */
    public function getById(int $requestId, int $userId, string $userRole): ?array
    {
        $request = Database::fetchOne(
            'SELECT sr.*, 
                    c.first_name as customer_first_name, 
                    c.last_name as customer_last_name,
                    c.email as customer_email,
                    c.phone as customer_phone,
                    m.first_name as mechanic_first_name,
                    m.last_name as mechanic_last_name,
                    m.phone as mechanic_phone,
                    v.make as vehicle_make,
                    v.model as vehicle_model,
                    v.year as vehicle_year,
                    v.license_plate as vehicle_license_plate
             FROM service_requests sr
             LEFT JOIN users c ON sr.customer_id = c.id
             LEFT JOIN users m ON sr.mechanic_id = m.id
             LEFT JOIN vehicles v ON sr.vehicle_id = v.id
             WHERE sr.id = ? AND sr.deleted_at IS NULL',
            [$requestId]
        );
        
        if ($request === null) {
            return null;
        }
        
        // Apply ownership/access checks
        $customerId = (int)$request['customer_id'];
        $mechanicId = $request['mechanic_id'] ? (int)$request['mechanic_id'] : null;
        
        if ($userRole === 'customer' && $customerId !== $userId) {
            return null; // Customers can only see their own requests
        }
        
        if ($userRole === 'mechanic' && $mechanicId !== $userId) {
            return null; // Mechanics can only see assigned requests
        }
        
        // Apply location privacy (hide exact coordinates for pending requests)
        if ($request['status'] === 'pending' && $userRole === 'mechanic') {
            $request['latitude_approximate'] = round((float)$request['latitude'], 2);
            $request['longitude_approximate'] = round((float)$request['longitude'], 2);
            unset($request['latitude']);
            unset($request['longitude']);
        }
        
        return $request;
    }
    
    /**
     * Get all service requests for a customer
     * 
     * @param int $customerId Customer user ID
     * @param string|null $status Optional status filter
     * @return array List of service requests
     */
    public function getCustomerRequests(int $customerId, ?string $status = null): array
    {
        $sql = 'SELECT sr.*, 
                       v.make as vehicle_make,
                       v.model as vehicle_model,
                       v.license_plate as vehicle_license_plate,
                       m.first_name as mechanic_first_name,
                       m.last_name as mechanic_last_name
                FROM service_requests sr
                LEFT JOIN vehicles v ON sr.vehicle_id = v.id
                LEFT JOIN users m ON sr.mechanic_id = m.id
                WHERE sr.customer_id = ? AND sr.deleted_at IS NULL';
        
        $params = [$customerId];
        
        if ($status !== null) {
            $sql .= ' AND sr.status = ?';
            $params[] = $status;
        }
        
        $sql .= ' ORDER BY sr.requested_at DESC';
        
        return Database::fetchAll($sql, $params);
    }
    
    /**
     * Get all service requests assigned to a mechanic
     * 
     * @param int $mechanicId Mechanic user ID
     * @param string|null $status Optional status filter
     * @return array List of service requests
     */
    public function getMechanicRequests(int $mechanicId, ?string $status = null): array
    {
        $sql = 'SELECT sr.*, 
                       c.first_name as customer_first_name,
                       c.last_name as customer_last_name,
                       c.phone as customer_phone,
                       v.make as vehicle_make,
                       v.model as vehicle_model,
                       v.license_plate as vehicle_license_plate
                FROM service_requests sr
                LEFT JOIN users c ON sr.customer_id = c.id
                LEFT JOIN vehicles v ON sr.vehicle_id = v.id
                WHERE sr.mechanic_id = ? AND sr.deleted_at IS NULL';
        
        $params = [$mechanicId];
        
        if ($status !== null) {
            $sql .= ' AND sr.status = ?';
            $params[] = $status;
        }
        
        $sql .= ' ORDER BY sr.requested_at DESC';
        
        return Database::fetchAll($sql, $params);
    }
    
    /**
     * Get nearby pending service requests for mechanics (approximate location only)
     * 
     * @param float $latitude Mechanic's current latitude
     * @param float $longitude Mechanic's current longitude
     * @param int $radiusKm Search radius in kilometers (default 50km)
     * @return array List of pending service requests with approximate location
     */
    public function getNearbyPendingRequests(float $latitude, float $longitude, int $radiusKm = 50): array
    {
        // Use Haversine formula for distance calculation
        // Note: This is an approximate calculation for small distances
        $sql = "SELECT sr.id,
                       sr.service_code,
                       sr.emergency_type,
                       sr.priority,
                       sr.requested_at,
                       ROUND(sr.latitude, 2) as latitude_approximate,
                       ROUND(sr.longitude, 2) as longitude_approximate,
                       v.make as vehicle_make,
                       v.model as vehicle_model,
                       v.year as vehicle_year,
                       (6371 * acos(
                           cos(radians(?)) * 
                           cos(radians(sr.latitude)) * 
                           cos(radians(sr.longitude) - radians(?)) + 
                           sin(radians(?)) * 
                           sin(radians(sr.latitude))
                       )) AS distance_km
                FROM service_requests sr
                LEFT JOIN vehicles v ON sr.vehicle_id = v.id
                WHERE sr.status = 'pending' 
                  AND sr.deleted_at IS NULL
                HAVING distance_km <= ?
                ORDER BY sr.priority DESC, distance_km ASC, sr.requested_at ASC
                LIMIT 50";
        
        return Database::fetchAll($sql, [$latitude, $longitude, $latitude, $radiusKm]);
    }
}
