<?php

use App\Core\Seeder;
use App\Core\Database;

/**
 * Vehicles Seeder
 * 
 * Seeds sample vehicles for existing users for testing purposes.
 */
class VehiclesSeeder extends Seeder
{
    /**
     * Run the seeder
     */
    public function run(): void
    {
        echo "Seeding vehicles...\n";

        // Get existing users
        $users = Database::fetchAll('SELECT id, email FROM users WHERE deleted_at IS NULL LIMIT 4');

        if (empty($users)) {
            echo "⚠ No users found. Please run user seeders first.\n";
            return;
        }

        $vehicles = [];

        foreach ($users as $index => $user) {
            $userId = (int)$user['id'];
            $userEmail = $user['email'];

            // Each user gets 1-2 vehicles
            $vehicleCount = ($index % 2 === 0) ? 2 : 1;

            for ($i = 0; $i < $vehicleCount; $i++) {
                $isPrimary = ($i === 0); // First vehicle is primary

                // Generate unique license plate
                $licensePlate = 'ABC' . str_pad($userId, 3, '0', STR_PAD_LEFT) . str_pad($i + 1, 2, '0', STR_PAD_LEFT);

                // Randomize vehicle data based on index
                $vehicleData = $this->getVehicleData($index + $i);

                $vehicles[] = [
                    'user_id' => $userId,
                    'license_plate' => $licensePlate,
                    'make' => $vehicleData['make'],
                    'model' => $vehicleData['model'],
                    'year' => $vehicleData['year'],
                    'color' => $vehicleData['color'],
                    'vin' => $this->generateVIN($userId, $i),
                    'vehicle_type' => $vehicleData['vehicle_type'],
                    'fuel_type' => $vehicleData['fuel_type'],
                    'nickname' => $vehicleData['nickname'],
                    'is_primary' => $isPrimary ? 1 : 0,
                    'status' => 'active'
                ];

                echo "  → Created vehicle for user {$userEmail}: {$vehicleData['make']} {$vehicleData['model']}\n";
            }
        }

        // Insert all vehicles
        foreach ($vehicles as $vehicle) {
            Database::insert('vehicles', $vehicle);
        }

        echo "✓ Seeded " . count($vehicles) . " vehicles\n";
    }

    /**
     * Get vehicle data based on index
     * 
     * @param int $index Index
     * @return array Vehicle data
     */
    private function getVehicleData(int $index): array
    {
        $vehicleTypes = [
            [
                'make' => 'Toyota',
                'model' => 'Corolla',
                'year' => 2020,
                'color' => 'Silver',
                'vehicle_type' => 'sedan',
                'fuel_type' => 'gasoline',
                'nickname' => 'Silver Bullet'
            ],
            [
                'make' => 'Honda',
                'model' => 'Civic',
                'year' => 2019,
                'color' => 'Blue',
                'vehicle_type' => 'sedan',
                'fuel_type' => 'gasoline',
                'nickname' => 'Blue Thunder'
            ],
            [
                'make' => 'Ford',
                'model' => 'F-150',
                'year' => 2021,
                'color' => 'Black',
                'vehicle_type' => 'truck',
                'fuel_type' => 'gasoline',
                'nickname' => 'Work Truck'
            ],
            [
                'make' => 'Chevrolet',
                'model' => 'Suburban',
                'year' => 2022,
                'color' => 'White',
                'vehicle_type' => 'suv',
                'fuel_type' => 'gasoline',
                'nickname' => 'Family SUV'
            ],
            [
                'make' => 'Tesla',
                'model' => 'Model 3',
                'year' => 2023,
                'color' => 'Red',
                'vehicle_type' => 'sedan',
                'fuel_type' => 'electric',
                'nickname' => 'Red Rocket'
            ],
            [
                'make' => 'Mazda',
                'model' => 'CX-5',
                'year' => 2020,
                'color' => 'Gray',
                'vehicle_type' => 'suv',
                'fuel_type' => 'gasoline',
                'nickname' => 'Gray Ghost'
            ],
            [
                'make' => 'Nissan',
                'model' => 'Altima',
                'year' => 2018,
                'color' => 'Silver',
                'vehicle_type' => 'sedan',
                'fuel_type' => 'gasoline',
                'nickname' => 'Commuter'
            ],
            [
                'make' => 'Jeep',
                'model' => 'Wrangler',
                'year' => 2021,
                'color' => 'Green',
                'vehicle_type' => 'suv',
                'fuel_type' => 'gasoline',
                'nickname' => 'Off-Roader'
            ]
        ];

        return $vehicleTypes[$index % count($vehicleTypes)];
    }

    /**
     * Generate a valid VIN
     * 
     * @param int $userId User ID
     * @param int $index Vehicle index
     * @return string VIN
     */
    private function generateVIN(int $userId, int $index): string
    {
        // Generate a pseudo-VIN (not a real VIN, just for testing)
        // Real VINs have complex check digit algorithms
        $prefix = '1HGBH41JXMN';
        $suffix = str_pad($userId, 3, '0', STR_PAD_LEFT) . str_pad($index, 2, '0', STR_PAD_LEFT);
        return $prefix . $suffix;
    }
}
