<?php

use App\Core\Seeder;

/**
 * Database Seeder Orchestrator
 * 
 * Coordinates execution of all seeders in the correct order.
 * Ensures data dependencies are respected.
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Run all seeders
     */
    public function run(): void
    {
        $this->log("===========================================");
        $this->log("Starting Database Seeding");
        $this->log("===========================================");

        $startTime = microtime(true);

        try {
            // Seed admin users first (they may be referenced by other seeders)
            $this->callSeeder(AdminUserSeeder::class);

            // Seed demo users
            $this->callSeeder(DemoUsersSeeder::class);

            $duration = round(microtime(true) - $startTime, 2);

            $this->log("===========================================");
            $this->log("Database Seeding Completed Successfully");
            $this->log("Duration: {$duration}s");
            $this->log("===========================================");

        } catch (\Exception $e) {
            $duration = round(microtime(true) - $startTime, 2);

            $this->log("===========================================");
            $this->log("Database Seeding Failed");
            $this->log("Error: " . $e->getMessage());
            $this->log("Duration: {$duration}s");
            $this->log("===========================================");

            throw $e;
        }
    }

    /**
     * Call a seeder class
     */
    private function callSeeder(string $seederClass): void
    {
        if (!class_exists($seederClass)) {
            throw new \Exception("Seeder class not found: {$seederClass}");
        }

        $seeder = new $seederClass();

        if (!$seeder instanceof Seeder) {
            throw new \Exception("Seeder must extend App\\Core\\Seeder: {$seederClass}");
        }

        $seeder->run();
    }
}
