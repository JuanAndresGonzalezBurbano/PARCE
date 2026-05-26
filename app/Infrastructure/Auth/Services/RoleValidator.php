<?php

namespace App\Infrastructure\Auth\Services;

use App\Core\Database;

/**
 * Role Validator Service
 * 
 * Provides role validation and checking functionality for RBAC.
 * Queries user_roles and roles tables with active role filtering,
 * expiration checking, and caching for performance.
 * 
 * Requirements: Design RBAC Integration section
 */
class RoleValidator
{
    /**
     * Role cache to avoid repeated database queries
     * 
     * @var array<int, array<string>>
     */
    private static array $roleCache = [];

    /**
     * Get all active roles for a user
     * 
     * Fetches roles from user_roles table with filtering:
     * - Only active roles (is_active = true)
     * - Non-expired roles (expires_at IS NULL OR expires_at > NOW())
     * - Active role definitions (roles.is_active = true)
     * 
     * @param int $userId User ID
     * @return array Array of role slugs
     */
    public function getUserRoles(int $userId): array
    {
        // Check cache first
        if (isset(self::$roleCache[$userId])) {
            return self::$roleCache[$userId];
        }

        try {
            $roles = Database::fetchAll(
                'SELECT r.slug
                 FROM user_roles ur
                 JOIN roles r ON ur.role_id = r.id
                 WHERE ur.user_id = ?
                   AND ur.is_active = TRUE
                   AND r.is_active = TRUE
                   AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
                   AND r.deleted_at IS NULL
                 ORDER BY r.slug',
                [$userId]
            );

            // Extract slugs from result
            $slugs = array_map(function($role) {
                return $role['slug'];
            }, $roles);

            // Cache the result
            self::$roleCache[$userId] = $slugs;

            return $slugs;

        } catch (\Exception $e) {
            error_log("RoleValidator::getUserRoles error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Check if user has a specific role
     * 
     * @param int $userId User ID
     * @param string $roleSlug Role slug to check
     * @return bool True if user has the role, false otherwise
     */
    public function hasRole(int $userId, string $roleSlug): bool
    {
        $roles = $this->getUserRoles($userId);
        return in_array($roleSlug, $roles, true);
    }

    /**
     * Check if user has at least one of the specified roles
     * 
     * @param int $userId User ID
     * @param array $roleSlugs Array of role slugs to check
     * @return bool True if user has at least one role, false otherwise
     */
    public function hasAnyRole(int $userId, array $roleSlugs): bool
    {
        if (empty($roleSlugs)) {
            return false;
        }

        $userRoles = $this->getUserRoles($userId);
        
        foreach ($roleSlugs as $roleSlug) {
            if (in_array($roleSlug, $userRoles, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the specified roles
     * 
     * @param int $userId User ID
     * @param array $roleSlugs Array of role slugs to check
     * @return bool True if user has all roles, false otherwise
     */
    public function hasAllRoles(int $userId, array $roleSlugs): bool
    {
        if (empty($roleSlugs)) {
            return false;
        }

        $userRoles = $this->getUserRoles($userId);
        
        foreach ($roleSlugs as $roleSlug) {
            if (!in_array($roleSlug, $userRoles, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Clear role cache for a specific user
     * 
     * Useful when roles are modified and cache needs to be invalidated
     * 
     * @param int $userId User ID
     * @return void
     */
    public function clearCache(int $userId): void
    {
        unset(self::$roleCache[$userId]);
    }

    /**
     * Clear all role caches
     * 
     * @return void
     */
    public function clearAllCaches(): void
    {
        self::$roleCache = [];
    }
}
