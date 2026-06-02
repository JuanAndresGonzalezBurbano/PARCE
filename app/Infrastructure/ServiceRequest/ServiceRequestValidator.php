<?php

namespace App\Infrastructure\ServiceRequest;

use App\Core\Request;

/**
 * Service Request Validator
 * 
 * Validates service request data for creation and updates.
 * Enforces business rules, data integrity, and lifecycle constraints.
 */
class ServiceRequestValidator
{
    /**
     * Valid emergency types
     */
    private const VALID_EMERGENCY_TYPES = [
        'tire',
        'battery',
        'fuel',
        'lockout',
        'tow',
        'engine',
        'other'
    ];

    /**
     * Valid statuses
     */
    private const VALID_STATUSES = [
        'pending',
        'assigned',
        'in_progress',
        'completed',
        'cancelled',
        'expired'
    ];

    /**
     * Active statuses (non-terminal)
     */
    private const ACTIVE_STATUSES = [
        'pending',
        'assigned',
        'in_progress'
    ];

    /**
     * Terminal statuses (cannot transition out)
     */
    private const TERMINAL_STATUSES = [
        'completed',
        'cancelled',
        'expired'
    ];

    /**
     * Valid priorities
     */
    private const VALID_PRIORITIES = [
        'normal',
        'urgent',
        'critical'
    ];

    /**
     * Validate service request creation
     * 
     * @param Request $request HTTP request
     * @return array Validation result ['valid' => bool, 'errors' => array]
     */
    public static function validateCreateRequest(Request $request): array
    {
        $errors = [];

        // vehicle_id (required)
        $vehicleId = $request->input('vehicle_id');
        if ($vehicleId === null || $vehicleId === '') {
            $errors['vehicle_id'] = 'Vehicle ID is required';
        } elseif (!is_numeric($vehicleId) || $vehicleId <= 0) {
            $errors['vehicle_id'] = 'Vehicle ID must be a positive integer';
        }

        // emergency_type (required)
        $emergencyType = $request->input('emergency_type');
        if (empty($emergencyType)) {
            $errors['emergency_type'] = 'Emergency type is required';
        } elseif (!in_array(strtolower($emergencyType), self::VALID_EMERGENCY_TYPES, true)) {
            $errors['emergency_type'] = 'Invalid emergency type. Valid types: ' . implode(', ', self::VALID_EMERGENCY_TYPES);
        }

        // description (required, min 10 chars)
        $description = $request->input('description');
        if (empty($description)) {
            $errors['description'] = 'Description is required';
        } elseif (strlen($description) < 10) {
            $errors['description'] = 'Description must be at least 10 characters';
        } elseif (strlen($description) > 5000) {
            $errors['description'] = 'Description must not exceed 5000 characters';
        }

        // latitude (required, range -90 to 90)
        $latitude = $request->input('latitude');
        if ($latitude === null || $latitude === '') {
            $errors['latitude'] = 'Latitude is required';
        } elseif (!is_numeric($latitude)) {
            $errors['latitude'] = 'Latitude must be a number';
        } else {
            $lat = (float)$latitude;
            if ($lat < -90 || $lat > 90) {
                $errors['latitude'] = 'Latitude must be between -90 and 90';
            }
        }

        // longitude (required, range -180 to 180)
        $longitude = $request->input('longitude');
        if ($longitude === null || $longitude === '') {
            $errors['longitude'] = 'Longitude is required';
        } elseif (!is_numeric($longitude)) {
            $errors['longitude'] = 'Longitude must be a number';
        } else {
            $lon = (float)$longitude;
            if ($lon < -180 || $lon > 180) {
                $errors['longitude'] = 'Longitude must be between -180 and 180';
            }
        }

        // priority (optional, default 'normal')
        $priority = $request->input('priority');
        if ($priority !== null && !in_array(strtolower($priority), self::VALID_PRIORITIES, true)) {
            $errors['priority'] = 'Invalid priority. Valid priorities: ' . implode(', ', self::VALID_PRIORITIES);
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate service request update
     * 
     * @param Request $request HTTP request
     * @return array Validation result ['valid' => bool, 'errors' => array]
     */
    public static function validateUpdateRequest(Request $request): array
    {
        $errors = [];

        // For updates, fields are optional but must be valid if provided

        // description
        $description = $request->input('description');
        if ($description !== null) {
            if (strlen($description) < 10) {
                $errors['description'] = 'Description must be at least 10 characters';
            } elseif (strlen($description) > 5000) {
                $errors['description'] = 'Description must not exceed 5000 characters';
            }
        }

        // latitude
        $latitude = $request->input('latitude');
        if ($latitude !== null) {
            if (!is_numeric($latitude)) {
                $errors['latitude'] = 'Latitude must be a number';
            } else {
                $lat = (float)$latitude;
                if ($lat < -90 || $lat > 90) {
                    $errors['latitude'] = 'Latitude must be between -90 and 90';
                }
            }
        }

        // longitude
        $longitude = $request->input('longitude');
        if ($longitude !== null) {
            if (!is_numeric($longitude)) {
                $errors['longitude'] = 'Longitude must be a number';
            } else {
                $lon = (float)$longitude;
                if ($lon < -180 || $lon > 180) {
                    $errors['longitude'] = 'Longitude must be between -180 and 180';
                }
            }
        }

        // priority
        $priority = $request->input('priority');
        if ($priority !== null && !in_array(strtolower($priority), self::VALID_PRIORITIES, true)) {
            $errors['priority'] = 'Invalid priority. Valid priorities: ' . implode(', ', self::VALID_PRIORITIES);
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate cancellation request
     * 
     * @param Request $request HTTP request
     * @return array Validation result ['valid' => bool, 'errors' => array]
     */
    public static function validateCancellationRequest(Request $request): array
    {
        $errors = [];

        // cancellation_reason (required, min 10 chars)
        $reason = $request->input('cancellation_reason');
        if (empty($reason)) {
            $errors['cancellation_reason'] = 'Cancellation reason is required';
        } elseif (strlen($reason) < 10) {
            $errors['cancellation_reason'] = 'Cancellation reason must be at least 10 characters';
        } elseif (strlen($reason) > 1000) {
            $errors['cancellation_reason'] = 'Cancellation reason must not exceed 1000 characters';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate rating request
     * 
     * @param Request $request HTTP request
     * @return array Validation result ['valid' => bool, 'errors' => array]
     */
    public static function validateRatingRequest(Request $request): array
    {
        $errors = [];

        // customer_rating (required, 1-5)
        $rating = $request->input('customer_rating');
        if ($rating === null || $rating === '') {
            $errors['customer_rating'] = 'Rating is required';
        } elseif (!is_numeric($rating)) {
            $errors['customer_rating'] = 'Rating must be a number';
        } else {
            $ratingInt = (int)$rating;
            if ($ratingInt < 1 || $ratingInt > 5) {
                $errors['customer_rating'] = 'Rating must be between 1 and 5';
            }
        }

        // customer_feedback (optional, max 2000 chars)
        $feedback = $request->input('customer_feedback');
        if ($feedback !== null && strlen($feedback) > 2000) {
            $errors['customer_feedback'] = 'Feedback must not exceed 2000 characters';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate status transition
     * 
     * @param string $currentStatus Current status
     * @param string $newStatus Desired new status
     * @return array Validation result ['valid' => bool, 'error' => string|null]
     */
    public static function validateStatusTransition(string $currentStatus, string $newStatus): array
    {
        // Cannot transition from terminal states
        if (in_array($currentStatus, self::TERMINAL_STATUSES, true)) {
            return [
                'valid' => false,
                'error' => "Cannot transition from terminal status '{$currentStatus}'"
            ];
        }

        // Define valid transitions
        $validTransitions = [
            'pending' => ['assigned', 'cancelled', 'expired'],
            'assigned' => ['in_progress', 'cancelled'],
            'in_progress' => ['completed']
        ];

        if (!isset($validTransitions[$currentStatus])) {
            return [
                'valid' => false,
                'error' => "Invalid current status '{$currentStatus}'"
            ];
        }

        if (!in_array($newStatus, $validTransitions[$currentStatus], true)) {
            return [
                'valid' => false,
                'error' => "Cannot transition from '{$currentStatus}' to '{$newStatus}'"
            ];
        }

        return ['valid' => true, 'error' => null];
    }

    /**
     * Check if status is active (non-terminal)
     * 
     * @param string $status Status to check
     * @return bool True if active
     */
    public static function isActiveStatus(string $status): bool
    {
        return in_array($status, self::ACTIVE_STATUSES, true);
    }

    /**
     * Check if status is terminal
     * 
     * @param string $status Status to check
     * @return bool True if terminal
     */
    public static function isTerminalStatus(string $status): bool
    {
        return in_array($status, self::TERMINAL_STATUSES, true);
    }

    /**
     * Generate service code
     * 
     * Format: SR-YYYY-NNNNNN (e.g., SR-2024-000123)
     * 
     * @param int $requestId Request ID
     * @return string Service code
     */
    public static function generateServiceCode(int $requestId): string
    {
        $year = date('Y');
        $paddedId = str_pad($requestId, 6, '0', STR_PAD_LEFT);
        return "SR-{$year}-{$paddedId}";
    }

    /**
     * Get valid emergency types
     * 
     * @return array List of valid emergency types
     */
    public static function getValidEmergencyTypes(): array
    {
        return self::VALID_EMERGENCY_TYPES;
    }

    /**
     * Get valid statuses
     * 
     * @return array List of valid statuses
     */
    public static function getValidStatuses(): array
    {
        return self::VALID_STATUSES;
    }

    /**
     * Get active statuses
     * 
     * @return array List of active statuses
     */
    public static function getActiveStatuses(): array
    {
        return self::ACTIVE_STATUSES;
    }

    /**
     * Get terminal statuses
     * 
     * @return array List of terminal statuses
     */
    public static function getTerminalStatuses(): array
    {
        return self::TERMINAL_STATUSES;
    }

    /**
     * Get valid priorities
     * 
     * @return array List of valid priorities
     */
    public static function getValidPriorities(): array
    {
        return self::VALID_PRIORITIES;
    }
}
