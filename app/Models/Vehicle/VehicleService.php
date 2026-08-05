<?php

namespace App\Models\Vehicle;

use App\Core\Database;
use App\Core\DomainException;
use App\Models\Vehicle\VehicleValidator;

/**
 * Servicio de Vehículos
 *
 * Lógica de negocio para gestión de vehículos: creación, actualización,
 * eliminación, y designación de vehículo principal.
 */
class VehicleService
{
    /**
     * Crear un nuevo vehículo
     *
     * @param int $userId ID del propietario
     * @param array $data Datos del vehículo
     * @return int ID del vehículo creado
     * @throws \Exception Si hay error de base de datos o de lógica de negocio
     */
    public function create(int $userId, array $data): int
    {
        // Normalizar placa
        $data['license_plate'] = VehicleValidator::normalizeLicensePlate($data['license_plate']);

        // Normalizar VIN si se proporcionó
        if (!empty($data['vin'])) {
            $data['vin'] = VehicleValidator::normalizeVIN($data['vin']);
        }

        // Verificar que la placa no exista (entre vehículos activos; una placa liberada
        // por un vehículo eliminado debe poder reutilizarse)
        $existing = Database::fetchOne(
            'SELECT id FROM vehicles WHERE license_plate = ? AND deleted_at IS NULL',
            [$data['license_plate']]
        );

        if ($existing !== null) {
            throw new DomainException('Ya existe un vehículo con esta placa', 409);
        }

        // Verificar que el VIN no exista (si se proporcionó)
        if (!empty($data['vin'])) {
            $existingVin = Database::fetchOne(
                'SELECT id FROM vehicles WHERE vin = ? AND deleted_at IS NULL',
                [$data['vin']]
            );

            if ($existingVin !== null) {
                throw new DomainException('Ya existe un vehículo con este VIN', 409);
            }
        }

        // Si es_principal es true, quitar el principal actual del usuario
        if (!empty($data['is_primary'])) {
            Database::update('vehicles', ['is_primary' => false], 'user_id = ?', [$userId]);
        }

        // Preparar datos de inserción
        $insertData = [
            'user_id'      => $userId,
            'license_plate'=> $data['license_plate'],
            'make'         => $data['make'],
            'model'        => $data['model'],
            'year'         => (int)$data['year'],
            'vehicle_type' => $data['vehicle_type'],
            'fuel_type'    => $data['fuel_type'],
            'is_primary'   => !empty($data['is_primary']) ? 1 : 0,
            'status'       => 'active',
        ];

        // Campos opcionales
        if (!empty($data['color']))             $insertData['color']             = $data['color'];
        if (!empty($data['vin']))               $insertData['vin']               = $data['vin'];
        if (!empty($data['nickname']))          $insertData['nickname']          = $data['nickname'];
        if (!empty($data['primary_photo_url'])) $insertData['primary_photo_url'] = $data['primary_photo_url'];

        // Documentos colombianos (SOAT y Tecnomecánica)
        if (!empty($data['soat_expiration_date']))
            $insertData['soat_expiration_date'] = $data['soat_expiration_date'];
        if (!empty($data['tecnomecanica_expiration_date']))
            $insertData['tecnomecanica_expiration_date'] = $data['tecnomecanica_expiration_date'];

        return Database::insert('vehicles', $insertData);
    }

    /**
     * Actualizar un vehículo existente
     *
     * @param int $vehicleId ID del vehículo
     * @param int $userId ID del propietario (para verificar ownership)
     * @param array $data Datos a actualizar
     * @return bool Éxito
     * @throws \Exception Si hay error o el usuario no es propietario
     */
    public function update(int $vehicleId, int $userId, array $data): bool
    {
        // Verificar que el vehículo existe y pertenece al usuario
        $vehicle = Database::fetchOne(
            'SELECT id, user_id, license_plate, vin FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [$vehicleId]
        );

        if ($vehicle === null) {
            throw new DomainException('Vehículo no encontrado', 404);
        }

        if ((int)$vehicle['user_id'] !== $userId) {
            throw new DomainException('No eres propietario de este vehículo', 403);
        }

        $updateData = [];

        // Placa
        if (isset($data['license_plate'])) {
            $normalizedPlate = VehicleValidator::normalizeLicensePlate($data['license_plate']);

            if ($normalizedPlate !== $vehicle['license_plate']) {
                $existing = Database::fetchOne(
                    'SELECT id FROM vehicles WHERE license_plate = ? AND id != ? AND deleted_at IS NULL',
                    [$normalizedPlate, $vehicleId]
                );

                if ($existing !== null) {
                    throw new DomainException('Ya existe un vehículo con esta placa', 409);
                }
            }

            $updateData['license_plate'] = $normalizedPlate;
        }

        // VIN
        if (isset($data['vin'])) {
            $normalizedVin = VehicleValidator::normalizeVIN($data['vin']);

            if ($normalizedVin !== null && $normalizedVin !== $vehicle['vin']) {
                $existingVin = Database::fetchOne(
                    'SELECT id FROM vehicles WHERE vin = ? AND id != ? AND deleted_at IS NULL',
                    [$normalizedVin, $vehicleId]
                );

                if ($existingVin !== null) {
                    throw new DomainException('Ya existe un vehículo con este VIN', 409);
                }
            }

            $updateData['vin'] = $normalizedVin;
        }

        // Campos simples
        if (isset($data['make']))             $updateData['make']              = $data['make'];
        if (isset($data['model']))            $updateData['model']             = $data['model'];
        if (isset($data['year']))             $updateData['year']              = (int)$data['year'];
        if (isset($data['color']))            $updateData['color']             = $data['color'];
        if (isset($data['vehicle_type']))     $updateData['vehicle_type']      = $data['vehicle_type'];
        if (isset($data['fuel_type']))        $updateData['fuel_type']         = $data['fuel_type'];
        if (isset($data['nickname']))         $updateData['nickname']          = $data['nickname'];
        if (isset($data['primary_photo_url'])) $updateData['primary_photo_url'] = $data['primary_photo_url'];
        if (isset($data['status']))           $updateData['status']            = $data['status'];

        // Documentos colombianos
        if (isset($data['soat_expiration_date']))
            $updateData['soat_expiration_date'] = $data['soat_expiration_date'];
        if (isset($data['tecnomecanica_expiration_date']))
            $updateData['tecnomecanica_expiration_date'] = $data['tecnomecanica_expiration_date'];

        // Flag de vehículo principal
        if (isset($data['is_primary']) && $data['is_primary']) {
            Database::update('vehicles', ['is_primary' => false], 'user_id = ? AND id != ?', [$userId, $vehicleId]);
            $updateData['is_primary'] = true;
        }

        if (empty($updateData)) {
            return true;
        }

        $rowCount = Database::update('vehicles', $updateData, 'id = ?', [$vehicleId]);

        return $rowCount > 0;
    }

    /**
     * Eliminar vehículo (soft delete)
     *
     * @param int $vehicleId ID del vehículo
     * @param int $userId ID del propietario
     * @return bool Éxito
     * @throws \Exception Si el vehículo no existe o no pertenece al usuario
     */
    public function delete(int $vehicleId, int $userId): bool
    {
        $vehicle = Database::fetchOne(
            'SELECT id, user_id, is_primary FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [$vehicleId]
        );

        if ($vehicle === null) {
            throw new DomainException('Vehículo no encontrado', 404);
        }

        if ((int)$vehicle['user_id'] !== $userId) {
            throw new DomainException('No eres propietario de este vehículo', 403);
        }

        $rowCount = Database::update('vehicles', [
            'status'     => 'inactive',
            'deleted_at' => date('Y-m-d H:i:s'),
        ], 'id = ?', [$vehicleId]);

        // Si era el principal, designar otro vehículo como principal
        if ($vehicle['is_primary']) {
            $anotherVehicle = Database::fetchOne(
                'SELECT id FROM vehicles WHERE user_id = ? AND deleted_at IS NULL AND id != ? ORDER BY created_at ASC LIMIT 1',
                [$userId, $vehicleId]
            );

            if ($anotherVehicle !== null) {
                Database::update('vehicles', ['is_primary' => true], 'id = ?', [$anotherVehicle['id']]);
            }
        }

        return $rowCount > 0;
    }

    /**
     * Establecer un vehículo como principal
     *
     * @param int $vehicleId ID del vehículo
     * @param int $userId ID del propietario
     * @return bool Éxito
     * @throws \Exception Si el vehículo no existe o no pertenece al usuario
     */
    public function setPrimary(int $vehicleId, int $userId): bool
    {
        $vehicle = Database::fetchOne(
            'SELECT id, user_id FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [$vehicleId]
        );

        if ($vehicle === null) {
            throw new DomainException('Vehículo no encontrado', 404);
        }

        if ((int)$vehicle['user_id'] !== $userId) {
            throw new DomainException('No eres propietario de este vehículo', 403);
        }

        // Ambas escrituras deben ser atómicas: si la segunda falla tras la
        // primera, el usuario quedaría sin ningún vehículo principal.
        Database::beginTransaction();
        try {
            Database::update('vehicles', ['is_primary' => false], 'user_id = ?', [$userId]);
            $rowCount = Database::update('vehicles', ['is_primary' => true], 'id = ?', [$vehicleId]);
            Database::commit();
            return $rowCount > 0;
        } catch (\Exception $e) {
            Database::rollback();
            throw $e;
        }
    }

    /**
     * Obtener vehículo por ID
     *
     * @param int $vehicleId ID del vehículo
     * @param int $userId ID del propietario (para verificar ownership)
     * @return array|null Datos del vehículo o null si no existe
     */
    public function getById(int $vehicleId, int $userId): ?array
    {
        return Database::fetchOne(
            'SELECT * FROM vehicles WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
            [$vehicleId, $userId]
        );
    }

    /**
     * Obtener todos los vehículos de un usuario
     *
     * @param int $userId ID del usuario
     * @param bool $activeOnly Solo vehículos activos
     * @return array Lista de vehículos
     */
    public function getUserVehicles(int $userId, bool $activeOnly = true): array
    {
        $sql    = 'SELECT * FROM vehicles WHERE user_id = ? AND deleted_at IS NULL';
        $params = [$userId];

        if ($activeOnly) {
            $sql      .= ' AND status = ?';
            $params[]  = 'active';
        }

        $sql .= ' ORDER BY is_primary DESC, created_at DESC';

        return Database::fetchAll($sql, $params);
    }

    /**
     * Obtener el vehículo principal del usuario
     *
     * @param int $userId ID del usuario
     * @return array|null Vehículo principal o null si no existe
     */
    public function getPrimaryVehicle(int $userId): ?array
    {
        return Database::fetchOne(
            'SELECT * FROM vehicles WHERE user_id = ? AND is_primary = TRUE AND deleted_at IS NULL AND status = ?',
            [$userId, 'active']
        );
    }
}
