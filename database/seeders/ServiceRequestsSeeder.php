<?php

use App\Core\Seeder;
use App\Core\Database;
use App\Infrastructure\ServiceRequest\ServiceRequestValidator;

/**
 * Service Requests Seeder
 * 
 * Seeds sample service requests for testing purposes.
 * Creates requests in various statuses to simulate a realistic scenario.
 */
class ServiceRequestsSeeder extends Seeder
{
    /**
     * Run the seeder
     */
    public function run(): void
    {
        echo "Seeding service requests...\n";

        // Get existing users by role
        $customers = Database::fetchAll(
            'SELECT u.id, u.email 
             FROM users u
             INNER JOIN user_roles ur ON u.id = ur.user_id
             INNER JOIN roles r ON ur.role_id = r.id
             WHERE r.name = ? AND u.deleted_at IS NULL
             LIMIT 2',
            ['customer']
        );

        $mechanics = Database::fetchAll(
            'SELECT u.id, u.email 
             FROM users u
             INNER JOIN user_roles ur ON u.id = ur.user_id
             INNER JOIN roles r ON ur.role_id = r.id
             WHERE r.name = ? AND u.deleted_at IS NULL
             LIMIT 2',
            ['mechanic']
        );

        if (empty($customers)) {
            echo "⚠ No customers found. Please run user seeders first.\n";
            return;
        }

        if (empty($mechanics)) {
            echo "⚠ No mechanics found. Service requests will be created without assignments.\n";
        }

        // Get vehicles for customers
        $vehicles = Database::fetchAll(
            'SELECT id, user_id, make, model FROM vehicles WHERE deleted_at IS NULL'
        );

        if (empty($vehicles)) {
            echo "⚠ No vehicles found. Please run vehicle seeder first.\n";
            return;
        }

        // Create service requests with different statuses
        $serviceRequests = [];
        $requestId = 1;

        // Request 1: Pending request (customer 1, vehicle 1)
        $customer1 = $customers[0];
        $vehicle1 = $this->getVehicleForCustomer($vehicles, (int)$customer1['id']);
        
        if ($vehicle1 !== null) {
            $serviceRequests[] = [
                'id' => $requestId,
                'service_code' => ServiceRequestValidator::generateServiceCode($requestId),
                'customer_id' => $customer1['id'],
                'vehicle_id' => $vehicle1['id'],
                'emergency_type' => 'tire',
                'description' => 'Flat tire on highway, need immediate assistance',
                'priority' => 'urgent',
                'latitude' => 40.7128,
                'longitude' => -74.0060,
                'status' => 'pending',
                'requested_at' => date('Y-m-d H:i:s', strtotime('-30 minutes'))
            ];
            echo "  → Created pending request for {$customer1['email']}: Flat tire\n";
            $requestId++;
        }

        // Request 2: Assigned request (customer 2, vehicle 2, mechanic 1)
        if (isset($customers[1]) && !empty($mechanics)) {
            $customer2 = $customers[1];
            $vehicle2 = $this->getVehicleForCustomer($vehicles, (int)$customer2['id']);
            
            if ($vehicle2 !== null) {
                $mechanic1 = $mechanics[0];
                $serviceRequests[] = [
                    'id' => $requestId,
                    'service_code' => ServiceRequestValidator::generateServiceCode($requestId),
                    'customer_id' => $customer2['id'],
                    'vehicle_id' => $vehicle2['id'],
                    'mechanic_id' => $mechanic1['id'],
                    'emergency_type' => 'battery',
                    'description' => 'Car won\'t start, battery seems dead',
                    'priority' => 'normal',
                    'latitude' => 40.7589,
                    'longitude' => -73.9851,
                    'status' => 'assigned',
                    'requested_at' => date('Y-m-d H:i:s', strtotime('-1 hour')),
                    'assigned_at' => date('Y-m-d H:i:s', strtotime('-45 minutes'))
                ];
                echo "  → Created assigned request for {$customer2['email']}: Dead battery\n";
                $requestId++;
            }
        }

        // Request 3: In-progress request (customer 1, another vehicle if available, mechanic 2)
        if (count($vehicles) > 1 && count($mechanics) > 1) {
            $vehicle3 = $vehicles[1];
            $mechanic2 = $mechanics[1];
            
            $serviceRequests[] = [
                'id' => $requestId,
                'service_code' => ServiceRequestValidator::generateServiceCode($requestId),
                'customer_id' => $vehicle3['user_id'],
                'vehicle_id' => $vehicle3['id'],
                'mechanic_id' => $mechanic2['id'],
                'emergency_type' => 'fuel',
                'description' => 'Ran out of gas on the highway',
                'priority' => 'normal',
                'latitude' => 40.7484,
                'longitude' => -73.9857,
                'status' => 'in_progress',
                'requested_at' => date('Y-m-d H:i:s', strtotime('-2 hours')),
                'assigned_at' => date('Y-m-d H:i:s', strtotime('-1 hour 45 minutes')),
                'started_at' => date('Y-m-d H:i:s', strtotime('-1 hour 30 minutes'))
            ];
            echo "  → Created in-progress request: Out of fuel\n";
            $requestId++;
        }

        // Request 4: Completed request with rating (customer 1, vehicle 1, mechanic 1)
        if (!empty($mechanics)) {
            $vehicle4 = $this->getVehicleForCustomer($vehicles, (int)$customer1['id']);
            
            if ($vehicle4 !== null) {
                $mechanic1 = $mechanics[0];
                $serviceRequests[] = [
                    'id' => $requestId,
                    'service_code' => ServiceRequestValidator::generateServiceCode($requestId),
                    'customer_id' => $customer1['id'],
                    'vehicle_id' => $vehicle4['id'],
                    'mechanic_id' => $mechanic1['id'],
                    'resolved_by' => $mechanic1['id'],
                    'emergency_type' => 'lockout',
                    'description' => 'Locked keys inside the car',
                    'priority' => 'normal',
                    'latitude' => 40.7306,
                    'longitude' => -73.9352,
                    'status' => 'completed',
                    'requested_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
                    'assigned_at' => date('Y-m-d H:i:s', strtotime('-1 day +10 minutes')),
                    'started_at' => date('Y-m-d H:i:s', strtotime('-1 day +30 minutes')),
                    'completed_at' => date('Y-m-d H:i:s', strtotime('-1 day +1 hour')),
                    'final_cost' => 75.00,
                    'customer_rating' => 5,
                    'customer_feedback' => 'Excellent service! Very fast response and professional.'
                ];
                echo "  → Created completed request for {$customer1['email']}: Car lockout (rated)\n";
                $requestId++;
            }
        }

        // Request 5: Cancelled request (customer 2)
        if (isset($customers[1])) {
            $customer2 = $customers[1];
            $vehicle5 = $this->getVehicleForCustomer($vehicles, (int)$customer2['id']);
            
            if ($vehicle5 !== null) {
                $serviceRequests[] = [
                    'id' => $requestId,
                    'service_code' => ServiceRequestValidator::generateServiceCode($requestId),
                    'customer_id' => $customer2['id'],
                    'vehicle_id' => $vehicle5['id'],
                    'emergency_type' => 'engine',
                    'description' => 'Engine making strange noises',
                    'priority' => 'normal',
                    'latitude' => 40.7580,
                    'longitude' => -73.9855,
                    'status' => 'cancelled',
                    'requested_at' => date('Y-m-d H:i:s', strtotime('-3 days')),
                    'cancelled_at' => date('Y-m-d H:i:s', strtotime('-3 days +5 minutes')),
                    'cancelled_by' => $customer2['id'],
                    'cancellation_reason' => 'Found another mechanic nearby who could help sooner'
                ];
                echo "  → Created cancelled request for {$customer2['email']}: Engine trouble\n";
                $requestId++;
            }
        }

        // Insert all service requests
        foreach ($serviceRequests as $request) {
            Database::insert('service_requests', $request);
        }

        echo "✓ Seeded " . count($serviceRequests) . " service requests\n";
    }

    /**
     * Get a vehicle for a specific customer
     * 
     * @param array $vehicles List of vehicles
     * @param int $customerId Customer ID
     * @return array|null Vehicle or null if not found
     */
    private function getVehicleForCustomer(array $vehicles, int $customerId): ?array
    {
        foreach ($vehicles as $vehicle) {
            if ((int)$vehicle['user_id'] === $customerId) {
                return $vehicle;
            }
        }
        return null;
    }
}
