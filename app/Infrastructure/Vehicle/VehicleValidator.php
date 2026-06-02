<?php

namespace App\Infrastructure\Vehicle;

use App\Core\Request;
use App\Infrastructure\Http\RequestValidator;

/**
 * Vehicle Validator
 * 
 * Validates vehicle data for creation and updates.
 * Enforces business rules and data integrity constraints.
 */
class VehicleValidator
{
    /**
     * Valid vehicle types
     */
    private const VALID_VEHICLE_TYPES = [
        'sedan',
        'suv',
        'truck',
        'motorcycle',
        'van',
        'other'
    ];

    /**
     * Valid fuel types
     */
    private const VALID_FUEL_TYPES = [
        'gasoline',
        'diesel',
        'electric',
        'hybrid',
        'other'
    ];

    /**
     * Valid status values
     */
    private const VALID_STATUSES = [
        'active',
        'inactive'
    ];

    /**
     * Validate vehicle creation request
     * 
     * @param Request $request HTTP request
     * @return array Validation result ['valid' => bool, 'errors' => array]
     */
    public static function validateCreateRequest(Request $request): array
    {
        $errors = [];

        // license_plate (required)
        $licensePlate = $request->input('license_plate');
        if (empty($licensePlate)) {
            $errors['license_plate'] = 'License plate is required';
        } elseif (strlen($licensePlate) > 20) {
            $errors['license_plate'] = 'License plate must not exceed 20 characters';
        }

        // make (required)
        $make = $request->input('make');
        if (empty($make)) {
            $errors['make'] = 'Vehicle make is required';
        } elseif (strlen($make) > 50) {
            $errors['make'] = 'Make must not exceed 50 characters';
        }

        // model (required)
        $model = $request->input('model');
        if (empty($model)) {
            $errors['model'] = 'Vehicle model is required';
        } elseif (strlen($model) > 50) {
            $errors['model'] = 'Model must not exceed 50 characters';
        }

        // year (required)
        $year = $request->input('year');
        if ($year === null || $year === '') {
            $errors['year'] = 'Year is required';
        } elseif (!is_numeric($year)) {
            $errors['year'] = 'Year must be a number';
        } else {
            $yearInt = (int)$year;
            $currentYear = (int)date('Y');
            if ($yearInt < 1900 || $yearInt > ($currentYear + 1)) {
                $errors['year'] = "Year must be between 1900 and " . ($currentYear + 1);
            }
        }

        // color (optional)
        $color = $request->input('color');
        if ($color !== null && strlen($color) > 30) {
            $errors['color'] = 'Color must not exceed 30 characters';
        }

        // vin (optional, but must be 17 chars if provided)
        $vin = $request->input('vin');
        if ($vin !== null && $vin !== '') {
            if (strlen($vin) !== 17) {
                $errors['vin'] = 'VIN must be exactly 17 characters';
            } elseif (!preg_match('/^[A-HJ-NPR-Z0-9]{17}$/', strtoupper($vin))) {
                $errors['vin'] = 'VIN contains invalid characters';
            }
        }

        // vehicle_type (required)
        $vehicleType = $request->input('vehicle_type');
        if (empty($vehicleType)) {
            $errors['vehicle_type'] = 'Vehicle type is required';
        } elseif (!in_array($vehicleType, self::VALID_VEHICLE_TYPES, true)) {
            $errors['vehicle_type'] = 'Invalid vehicle type. Valid types: ' . implode(', ', self::VALID_VEHICLE_TYPES);
        }

        // fuel_type (required)
        $fuelType = $request->input('fuel_type');
        if (empty($fuelType)) {
            $errors['fuel_type'] = 'Fuel type is required';
        } elseif (!in_array($fuelType, self::VALID_FUEL_TYPES, true)) {
            $errors['fuel_type'] = 'Invalid fuel type. Valid types: ' . implode(', ', self::VALID_FUEL_TYPES);
        }

        // nickname (optional)
        $nickname = $request->input('nickname');
        if ($nickname !== null && strlen($nickname) > 50) {
            $errors['nickname'] = 'Nickname must not exceed 50 characters';
        }

        // primary_photo_url (optional)
        $photoUrl = $request->input('primary_photo_url');
        if ($photoUrl !== null && strlen($photoUrl) > 255) {
            $errors['primary_photo_url'] = 'Photo URL must not exceed 255 characters';
        } elseif ($photoUrl !== null && !filter_var($photoUrl, FILTER_VALIDATE_URL)) {
            $errors['primary_photo_url'] = 'Photo URL must be a valid URL';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate vehicle update request
     * 
     * @param Request $request HTTP request
     * @return array Validation result ['valid' => bool, 'errors' => array]
     */
    public static function validateUpdateRequest(Request $request): array
    {
        $errors = [];

        // For updates, all fields are optional but must be valid if provided

        // license_plate
        $licensePlate = $request->input('license_plate');
        if ($licensePlate !== null) {
            if (empty($licensePlate)) {
                $errors['license_plate'] = 'License plate cannot be empty';
            } elseif (strlen($licensePlate) > 20) {
                $errors['license_plate'] = 'License plate must not exceed 20 characters';
            }
        }

        // make
        $make = $request->input('make');
        if ($make !== null) {
            if (empty($make)) {
                $errors['make'] = 'Vehicle make cannot be empty';
            } elseif (strlen($make) > 50) {
                $errors['make'] = 'Make must not exceed 50 characters';
            }
        }

        // model
        $model = $request->input('model');
        if ($model !== null) {
            if (empty($model)) {
                $errors['model'] = 'Vehicle model cannot be empty';
            } elseif (strlen($model) > 50) {
                $errors['model'] = 'Model must not exceed 50 characters';
            }
        }

        // year
        $year = $request->input('year');
        if ($year !== null) {
            if (!is_numeric($year)) {
                $errors['year'] = 'Year must be a number';
            } else {
                $yearInt = (int)$year;
                $currentYear = (int)date('Y');
                if ($yearInt < 1900 || $yearInt > ($currentYear + 1)) {
                    $errors['year'] = "Year must be between 1900 and " . ($currentYear + 1);
                }
            }
        }

        // color
        $color = $request->input('color');
        if ($color !== null && strlen($color) > 30) {
            $errors['color'] = 'Color must not exceed 30 characters';
        }

        // vin
        $vin = $request->input('vin');
        if ($vin !== null && $vin !== '') {
            if (strlen($vin) !== 17) {
                $errors['vin'] = 'VIN must be exactly 17 characters';
            } elseif (!preg_match('/^[A-HJ-NPR-Z0-9]{17}$/', strtoupper($vin))) {
                $errors['vin'] = 'VIN contains invalid characters';
            }
        }

        // vehicle_type
        $vehicleType = $request->input('vehicle_type');
        if ($vehicleType !== null && !in_array($vehicleType, self::VALID_VEHICLE_TYPES, true)) {
            $errors['vehicle_type'] = 'Invalid vehicle type. Valid types: ' . implode(', ', self::VALID_VEHICLE_TYPES);
        }

        // fuel_type
        $fuelType = $request->input('fuel_type');
        if ($fuelType !== null && !in_array($fuelType, self::VALID_FUEL_TYPES, true)) {
            $errors['fuel_type'] = 'Invalid fuel type. Valid types: ' . implode(', ', self::VALID_FUEL_TYPES);
        }

        // nickname
        $nickname = $request->input('nickname');
        if ($nickname !== null && strlen($nickname) > 50) {
            $errors['nickname'] = 'Nickname must not exceed 50 characters';
        }

        // primary_photo_url
        $photoUrl = $request->input('primary_photo_url');
        if ($photoUrl !== null && strlen($photoUrl) > 255) {
            $errors['primary_photo_url'] = 'Photo URL must not exceed 255 characters';
        } elseif ($photoUrl !== null && $photoUrl !== '' && !filter_var($photoUrl, FILTER_VALIDATE_URL)) {
            $errors['primary_photo_url'] = 'Photo URL must be a valid URL';
        }

        // status
        $status = $request->input('status');
        if ($status !== null && !in_array($status, self::VALID_STATUSES, true)) {
            $errors['status'] = 'Invalid status. Valid statuses: ' . implode(', ', self::VALID_STATUSES);
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Normalize license plate
     * 
     * Converts to uppercase, trims whitespace, normalizes formatting
     * 
     * @param string $licensePlate Raw license plate
     * @return string Normalized license plate
     */
    public static function normalizeLicensePlate(string $licensePlate): string
    {
        // Convert to uppercase
        $normalized = strtoupper($licensePlate);
        
        // Trim whitespace
        $normalized = trim($normalized);
        
        // Remove excessive spaces (replace multiple spaces with single space)
        $normalized = preg_replace('/\s+/', ' ', $normalized);
        
        return $normalized;
    }

    /**
     * Normalize VIN
     * 
     * Converts to uppercase, trims whitespace
     * 
     * @param string|null $vin Raw VIN
     * @return string|null Normalized VIN
     */
    public static function normalizeVIN(?string $vin): ?string
    {
        if ($vin === null || $vin === '') {
            return null;
        }
        
        // Convert to uppercase and trim
        return strtoupper(trim($vin));
    }

    /**
     * Get valid vehicle types
     * 
     * @return array List of valid vehicle types
     */
    public static function getValidVehicleTypes(): array
    {
        return self::VALID_VEHICLE_TYPES;
    }

    /**
     * Get valid fuel types
     * 
     * @return array List of valid fuel types
     */
    public static function getValidFuelTypes(): array
    {
        return self::VALID_FUEL_TYPES;
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
}
