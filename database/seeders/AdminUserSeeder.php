<?php

use App\Core\Seeder;
use App\Core\Database;
use App\Infrastructure\Auth\Services\PasswordHasher;

/**
 * Admin User Seeder
 * 
 * Creates administrative users for system management:
 * - Super Administrator: Full system access
 * - Administrator: Standard administrative access
 * 
 * Credentials (for development/testing only):
 * - superadmin@parce.local / SuperAdmin123!
 * - admin@parce.local / Admin123!
 */
class AdminUserSeeder extends Seeder
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
        $this->log("Seeding admin users...");

        try {
            $this->beginTransaction();

            // Get role IDs
            $superAdminRole = $this->findOne('roles', 'slug = ?', ['super_admin']);
            $adminRole = $this->findOne('roles', 'slug = ?', ['administrator']);

            if (!$superAdminRole || !$adminRole) {
                throw new \Exception('Required roles not found. Run migrations first.');
            }

            // Create Super Administrator
            $this->createAdminUser(
                email: 'superadmin@parce.local',
                password: 'SuperAdmin123!',
                firstName: 'Super',
                lastName: 'Administrator',
                phone: '+1234567890',
                roleId: (int) $superAdminRole['id'],
                roleName: 'Super Administrator'
            );

            // Create Administrator
            $this->createAdminUser(
                email: 'admin@parce.local',
                password: 'Admin123!',
                firstName: 'System',
                lastName: 'Administrator',
                phone: '+1234567891',
                roleId: (int) $adminRole['id'],
                roleName: 'Administrator'
            );

            $this->commit();
            $this->log("✓ Admin users seeded successfully");

        } catch (\Exception $e) {
            $this->rollback();
            $this->log("✗ Failed to seed admin users: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create admin user with role assignment
     */
    private function createAdminUser(
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
            'email_verification_status' => 'verified',
            'email_verified_at' => date('Y-m-d H:i:s'),
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
