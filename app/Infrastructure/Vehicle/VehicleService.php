<?php

namespace App\Infrastructure\Vehicle;

use App\Core\Database;
use App\Infrastructure\Vehicle\VehicleValidator;

/**
 * Vehicle Service
 * 
 * Business logic for vehicle management including creation, updates,
 * deletion, and primary vehicle designation.
 */
class VehicleService
{
    /**
     * Create a new vehicle
     * 
     * @param int $userId Owner user ID
     * @param array $data Vehicle data
     * @return int Created vehicle ID
     * @throws \Exception On database or business logic error
     */
    public function create(int $userId, array $data): int
    {
        // Normalize license plate
        $data['license_plate'] = VehicleValidator::normalizeLicensePlate($data['license_plate']);
        
        // Normalize VIN if provided
        if (!empty($data['vin'])) {
            $data['vin'] = VehicleValidator::normalizeVIN($data['vin']);
        }
        
        // Check if license plate already exists
        $existing = Database::fetchOne(
            'SELECT id FROM vehicles WHERE license_plate = ?',
            [$data['license_plate']]
        );
        
        if ($existing !== null) {
            throw new \Exception('Vehicle with this license plate already exists');
        }
        
        // Check if VIN already exists (if provided)
        if (!empty($data['vin'])) {
            $existingVin = Database::fetchOne(
                'SELECT id FROM vehicles WHERE vin = ?',
                [$data['vin']]
            );
            
            if ($existingVin !== null) {
                throw new \Exception('Vehicle with this VIN already exists');
            }
        }
        
        // If is_primary is true, unset other primary vehicles for this user
        if (!empty($data['is_primary'])) {
            Database::update('vehicles', [
                'is_primary' => false
            ], 'user_id = ?', [$userId]);
        }
        
        // Prepare insert data
        $insertData = [
            'user_id' => $userId,
            'license_plate' => $data['license_plate'],
            'make' => $data['make'],
            'model' => $data['model'],
            'year' => (int)$data['year'],
            'vehicle_type' => $data['vehicle_type'],
            'fuel_type' => $data['fuel_type'],
            'is_primary' => !empty($data['is_primary']) ? 1 : 0,
            'status' => 'active'
        ];
        
        // Add optional fields
        if (!empty($data['color'])) {
            $insertData['color'] = $data['color'];
        }
        
        if (!empty($data['vin'])) {
            $insertData['vin'] = $data['vin'];
        }
        
        if (!empty($data['nickname'])) {
            $insertData['nickname'] = $data['nickname'];
        }
        
        if (!empty($data['primary_photo_url'])) {
            $insertData['primary_photo_url'] = $data['primary_photo_url'];
        }
        
        // Insert vehicle
        return Database::insert('vehicles', $insertData);
    }
    
    /**
     * Update an existing vehicle
     * 
     * @param int $vehicleId Vehicle ID
     * @param int $userId Owner user ID (for ownership verification)
     * @param array $data Update data
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function update(int $vehicleId, int $userId, array $data): bool
    {
        // Verify vehicle exists and user owns it
        $vehicle = Database::fetchOne(
            'SELECT id, user_id, license_plate, vin FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [$vehicleId]
        );
        
        if ($vehicle === null) {
            throw new \Exception('Vehicle not found');
        }
        
        if ((int)$vehicle['user_id'] !== $userId) {
            throw new \Exception('You do not own this vehicle');
        }
        
        // Prepare update data
        $updateData = [];
        
        // License plate
        if (isset($data['license_plate'])) {
            $normalizedPlate = VehicleValidator::normalizeLicensePlate($data['license_plate']);
            
            // Check if new license plate already exists (excluding current vehicle)
            if ($normalizedPlate !== $vehicle['license_plate']) {
                $existing = Database::fetchOne(
                    'SELECT id FROM vehicles WHERE license_plate = ? AND id != ?',
                    [$normalizedPlate, $vehicleId]
                );
                
                if ($existing !== null) {
                    throw new \Exception('Vehicle with this license plate already exists');
                }
            }
            
            $updateData['license_plate'] = $normalizedPlate;
        }
        
        // VIN
        if (isset($data['vin'])) {
            $normalizedVin = VehicleValidator::normalizeVIN($data['vin']);
            
            if ($normalizedVin !== null && $normalizedVin !== $vehicle['vin']) {
                $existingVin = Database::fetchOne(
                    'SELECT id FROM vehicles WHERE vin = ? AND id != ?',
                    [$normalizedVin, $vehicleId]
                );
                
                if ($existingVin !== null) {
                    throw new \Exception('Vehicle with this VIN already exists');
                }
            }
            
            $updateData['vin'] = $normalizedVin;
        }
        
        // Simple fields
        if (isset($data['make'])) $updateData['make'] = $data['make'];
        if (isset($data['model'])) $updateData['model'] = $data['model'];
        if (isset($data['year'])) $updateData['year'] = (int)$data['year'];
        if (isset($data['color'])) $updateData['color'] = $data['color'];
        if (isset($data['vehicle_type'])) $updateData['vehicle_type'] = $data['vehicle_type'];
        if (isset($data['fuel_type'])) $updateData['fuel_type'] = $data['fuel_type'];
        if (isset($data['nickname'])) $updateData['nickname'] = $data['nickname'];
        if (isset($data['primary_photo_url'])) $updateData['primary_photo_url'] = $data['primary_photo_url'];
        if (isset($data['status'])) $updateData['status'] = $data['status'];
        
        // Handle is_primary flag
        if (isset($data['is_primary']) && $data['is_primary']) {
            // Unset other primary vehicles for this user
            Database::update('vehicles', [
                'is_primary' => false
            ], 'user_id = ? AND id != ?', [$userId, $vehicleId]);
            
            $updateData['is_primary'] = true;
        }
        
        // If nothing to update
        if (empty($updateData)) {
            return true;
        }
        
        // Update vehicle
        $rowCount = Database::update('vehicles', $updateData, 'id = ?', [$vehicleId]);
        
        return $rowCount > 0;
    }
    
    /**
     * Soft delete a vehicle
     * 
     * @param int $vehicleId Vehicle ID
     * @param int $userId Owner user ID (for ownership verification)
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function delete(int $vehicleId, int $userId): bool
    {
        // Verify vehicle exists and user owns it
        $vehicle = Database::fetchOne(
            'SELECT id, user_id, is_primary FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [$vehicleId]
        );
        
        if ($vehicle === null) {
            throw new \Exception('Vehicle not found');
        }
        
        if ((int)$vehicle['user_id'] !== $userId) {
            throw new \Exception('You do not own this vehicle');
        }
        
        // Soft delete
        $rowCount = Database::update('vehicles', [
            'status' => 'inactive',
            'deleted_at' => date('Y-m-d H:i:s')
        ], 'id = ?', [$vehicleId]);
        
        // If this was the primary vehicle, try to set another vehicle as primary
        if ($vehicle['is_primary']) {
            $anotherVehicle = Database::fetchOne(
                'SELECT id FROM vehicles WHERE user_id = ? AND deleted_at IS NULL AND id != ? ORDER BY created_at ASC LIMIT 1',
                [$userId, $vehicleId]
            );
            
            if ($anotherVehicle !== null) {
                Database::update('vehicles', [
                    'is_primary' => true
                ], 'id = ?', [$anotherVehicle['id']]);
            }
        }
        
        return $rowCount > 0;
    }
    
    /**
     * Set a vehicle as primary
     * 
     * @param int $vehicleId Vehicle ID
     * @param int $userId Owner user ID (for ownership verification)
     * @return bool Success
     * @throws \Exception On database or business logic error
     */
    public function setPrimary(int $vehicleId, int $userId): bool
    {
        // Verify vehicle exists and user owns it
        $vehicle = Database::fetchOne(
            'SELECT id, user_id FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [$vehicleId]
        );
        
        if ($vehicle === null) {
            throw new \Exception('Vehicle not found');
        }
        
        if ((int)$vehicle['user_id'] !== $userId) {
            throw new \Exception('You do not own this vehicle');
        }
        
        // Unset other primary vehicles for this user
        Database::update('vehicles', [
            'is_primary' => false
        ], 'user_id = ?', [$userId]);
        
        // Set this vehicle as primary
        $rowCount = Database::update('vehicles', [
            'is_primary' => true
        ], 'id = ?', [$vehicleId]);
        
        return $rowCount > 0;
    }
    
    /**
     * Get vehicle by ID
     * 
     * @param int $vehicleId Vehicle ID
     * @param int $userId Owner user ID (for ownership verification)
     * @return array|null Vehicle data or null if not found
     */
    public function getById(int $vehicleId, int $userId): ?array
    {
        $vehicle = Database::fetchOne(
            'SELECT * FROM vehicles WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
            [$vehicleId, $userId]
        );
        
        return $vehicle;
    }
    
    /**
     * Get all vehicles for a user
     * 
     * @param int $userId User ID
     * @param bool $activeOnly Only return active vehicles
     * @return array List of vehicles
     */
    public function getUserVehicles(int $userId, bool $activeOnly = true): array
    {
        $sql = 'SELECT * FROM vehicles WHERE user_id = ? AND deleted_at IS NULL';
        $params = [$userId];
        
        if ($activeOnly) {
            $sql .= ' AND status = ?';
            $params[] = 'active';
        }
        
        $sql .= ' ORDER BY is_primary DESC, created_at DESC';
        
        return Database::fetchAll($sql, $params);
    }
    
    /**
     * Get user's primary vehicle
     * 
     * @param int $userId User ID
     * @return array|null Primary vehicle or null if not found
     */
    public function getPrimaryVehicle(int $userId): ?array
    {
        return Database::fetchOne(
            'SELECT * FROM vehicles WHERE user_id = ? AND is_primary = TRUE AND deleted_at IS NULL AND status = ?',
            [$userId, 'active']
        );
    }
}
