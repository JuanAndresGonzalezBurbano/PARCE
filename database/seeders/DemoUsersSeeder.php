<?php

use App\Core\Seeder;
use App\Core\Database;
use App\Infrastructure\Auth\Services\PasswordHasher;

/**
 * Demo Users Seeder
 * 
 * Creates demo users for testing and development:
 * - Customer: Standard customer account
 * - Mechanic: Mechanic service provider account
 * 
 * Credentials (for development/testing only):
 * - customer@parce.local / Customer123!
 * - mechanic@parce.local / Mechanic123!
 */
class DemoUsersSeeder extends Seeder
{
    private PasswordHasher $passwordHasher;

    public function __construct()
    {
        parent::__construct();
        $this->passwordHasher = new PasswordHasher();
    }

    /**
     * Run the seeder
     */
    public function run(): void
    {
        $this->log("Seeding demo users...");

        try {
            $this->beginTransaction();

            // Get role IDs
            $customerRole = $this->findOne('roles', 'slug = ?', ['customer']);
            $mechanicRole = $this->findOne('roles', 'slug = ?', ['mechanic']);

            if (!$customerRole || !$mechanicRole) {
                throw new \Exception('Required roles not found. Run migrations first.');
            }

            // Create Customer
            $this->createDemoUser(
                email: 'customer@parce.local',
                password: 'Customer123!',
                firstName: 'Demo',
                lastName: 'Customer',
                phone: '+1234567892',
                roleId: (int) $customerRole['id'],
                roleName: 'Customer'
            );

            // Create Mechanic
            $this->createDemoUser(
                email: 'mechanic@parce.local',
                password: 'Mechanic123!',
                firstName: 'Demo',
                lastName: 'Mechanic',
                phone: '+1234567893',
                roleId: (int) $mechanicRole['id'],
                roleName: 'Mechanic'
            );

            $this->commit();
            $this->log("✓ Demo users seeded successfully");

        } catch (\Exception $e) {
            $this->rollback();
            $this->log("✗ Failed to seed demo users: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create demo user with role assignment
     */
    private function createDemoUser(
        string $email,
        string $password,
        string $firstName,
        string $lastName,
        string $phone,
        int $roleId,
        string $roleName
    ): void {
        // Check if user already exists
        if ($this->exists('users', 'email = ?', [$email])) {
            $this->log("  - User {$email} already exists, skipping...");
            return;
        }

        // Hash password
        $passwordHash = $this->passwordHasher->hash($password);

        // Insert user
        $userId = $this->insert('users', [
            'email' => $email,
            'password_hash' => $passwordHash,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $phone,
            'account_status' => 'active',
            'email_verification_status' => 'unverified',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        // Assign role
        $this->insert('user_roles', [
            'user_id' => $userId,
            'role_id' => $roleId,
            'assigned_by' => null, // System-assigned
            'is_active' => true,
            'assigned_at' => date('Y-m-d H:i:s'),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        $this->log("  ✓ Created {$roleName}: {$email}");
    }
}
