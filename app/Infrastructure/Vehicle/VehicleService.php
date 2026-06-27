<?php

namespace App\Infrastructure\Vehicle;

use App\Core\Database;
use App\Infrastructure\Vehicle\VehicleValidator;

/**
 * Vehicle Service
 *
 * Lógica de negocio para la gestión de vehículos:
 *  - CRUD completo con soft-delete (nunca se borran filas físicamente)
 *  - Manejo del vehículo principal (is_primary)
 *  - Almacenamiento y validación de documentos obligatorios en Colombia:
 *      · SOAT (Seguro Obligatorio de Accidentes de Tránsito)
 *      · Tecnomecánica (Revisión técnico-mecánica)
 *  - Bloqueo de reactivación si los documentos están vencidos
 */
class VehicleService
{
    // =========================================================================
    // create()
    // =========================================================================

    /**
     * Crea un nuevo vehículo para el usuario.
     *
     * Los campos de SOAT y tecnomecánica son opcionales en la creación,
     * pero si se envían se persisten junto con el vehículo.
     *
     * @param int   $userId Propietario del vehículo
     * @param array $data   Datos del vehículo (validados por VehicleValidator antes de llegar aquí)
     * @return int          ID del vehículo creado
     * @throws \Exception
     */
    public function create(int $userId, array $data): int
    {
        // Normalizar placa (mayúsculas, sin espacios)
        $data['license_plate'] = VehicleValidator::normalizeLicensePlate($data['license_plate']);

        // Normalizar VIN si fue enviado
        if (!empty($data['vin'])) {
            $data['vin'] = VehicleValidator::normalizeVIN($data['vin']);
        }

        // La placa debe ser única en todo el sistema
        $existing = Database::fetchOne(
            'SELECT id FROM vehicles WHERE license_plate = ?',
            [$data['license_plate']]
        );
        if ($existing !== null) {
            throw new \Exception('Vehicle with this license plate already exists');
        }

        // El VIN también debe ser único (si se proporcionó)
        if (!empty($data['vin'])) {
            $existingVin = Database::fetchOne(
                'SELECT id FROM vehicles WHERE vin = ?',
                [$data['vin']]
            );
            if ($existingVin !== null) {
                throw new \Exception('Vehicle with this VIN already exists');
            }
        }

        // Si se pide que sea el vehículo principal, desmarcar los demás del usuario
        if (!empty($data['is_primary'])) {
            Database::update('vehicles', ['is_primary' => false], 'user_id = ?', [$userId]);
        }

        // ---- Campos base obligatorios ----
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

        // ---- Campos opcionales estándar ----
        if (!empty($data['color']))             $insertData['color']              = $data['color'];
        if (!empty($data['vin']))               $insertData['vin']                = $data['vin'];
        if (!empty($data['nickname']))          $insertData['nickname']           = $data['nickname'];
        if (!empty($data['primary_photo_url'])) $insertData['primary_photo_url']  = $data['primary_photo_url'];

        // ---- Campos SOAT (Seguro Obligatorio) ----
        // Almacenamos número, fecha de vencimiento y URL del documento escaneado
        if (!empty($data['soat_number']))           $insertData['soat_number']            = $data['soat_number'];
        if (!empty($data['soat_expiration_date']))   $insertData['soat_expiration_date']   = $data['soat_expiration_date'];
        if (!empty($data['soat_document_url']))      $insertData['soat_document_url']      = $data['soat_document_url'];
        // Registrar cuándo se subió el documento SOAT
        if (!empty($data['soat_document_url']))      $insertData['soat_uploaded_at']       = date('Y-m-d H:i:s');

        // ---- Campos Tecnomecánica (Revisión técnica) ----
        if (!empty($data['tecnomecanica_number']))           $insertData['tecnomecanica_number']            = $data['tecnomecanica_number'];
        if (!empty($data['tecnomecanica_expiration_date']))  $insertData['tecnomecanica_expiration_date']   = $data['tecnomecanica_expiration_date'];
        if (!empty($data['tecnomecanica_document_url']))     $insertData['tecnomecanica_document_url']      = $data['tecnomecanica_document_url'];
        // Registrar cuándo se subió el documento de tecnomecánica
        if (!empty($data['tecnomecanica_document_url']))     $insertData['tecnomecanica_uploaded_at']       = date('Y-m-d H:i:s');

        return Database::insert('vehicles', $insertData);
    }

    // =========================================================================
    // update()
    // =========================================================================

    /**
     * Actualiza los datos de un vehículo existente.
     *
     * Regla de negocio extra:
     *   Si se intenta cambiar el estado a 'active' pero los documentos SOAT
     *   o tecnomecánica están vencidos, se lanza excepción. El usuario debe
     *   renovar los documentos antes de reactivar el vehículo.
     *
     * @param int   $vehicleId ID del vehículo
     * @param int   $userId    Propietario (para verificar pertenencia)
     * @param array $data      Campos a actualizar
     * @return bool            true si al menos una fila fue modificada
     * @throws \Exception
     */
    public function update(int $vehicleId, int $userId, array $data): bool
    {
        // Verificar que el vehículo exista y pertenezca al usuario
        $vehicle = Database::fetchOne(
            'SELECT id, user_id, license_plate, vin,
                    soat_expiration_date, tecnomecanica_expiration_date
             FROM vehicles WHERE id = ? AND deleted_at IS NULL',
            [$vehicleId]
        );

        if ($vehicle === null) {
            throw new \Exception('Vehicle not found');
        }
        if ((int)$vehicle['user_id'] !== $userId) {
            throw new \Exception('You do not own this vehicle');
        }

        $updateData = [];

        // ---- Placa ----
        if (isset($data['license_plate'])) {
            $normalizedPlate = VehicleValidator::normalizeLicensePlate($data['license_plate']);
            if ($normalizedPlate !== $vehicle['license_plate']) {
                $dup = Database::fetchOne(
                    'SELECT id FROM vehicles WHERE license_plate = ? AND id != ?',
                    [$normalizedPlate, $vehicleId]
                );
                if ($dup !== null) {
                    throw new \Exception('Vehicle with this license plate already exists');
                }
            }
            $updateData['license_plate'] = $normalizedPlate;
        }

        // ---- VIN ----
        if (isset($data['vin'])) {
            $normalizedVin = VehicleValidator::normalizeVIN($data['vin']);
            if ($normalizedVin !== null && $normalizedVin !== $vehicle['vin']) {
                $dupVin = Database::fetchOne(
                    'SELECT id FROM vehicles WHERE vin = ? AND id != ?',
                    [$normalizedVin, $vehicleId]
                );
                if ($dupVin !== null) {
                    throw new \Exception('Vehicle with this VIN already exists');
                }
            }
            $updateData['vin'] = $normalizedVin;
        }

        // ---- Campos simples estándar ----
        if (isset($data['make']))              $updateData['make']              = $data['make'];
        if (isset($data['model']))             $updateData['model']             = $data['model'];
        if (isset($data['year']))              $updateData['year']              = (int)$data['year'];
        if (isset($data['color']))             $updateData['color']             = $data['color'];
        if (isset($data['vehicle_type']))      $updateData['vehicle_type']      = $data['vehicle_type'];
        if (isset($data['fuel_type']))         $updateData['fuel_type']         = $data['fuel_type'];
        if (isset($data['nickname']))          $updateData['nickname']          = $data['nickname'];
        if (isset($data['primary_photo_url'])) $updateData['primary_photo_url'] = $data['primary_photo_url'];

        // ---- Actualización de campos SOAT ----
        if (isset($data['soat_number']))           $updateData['soat_number']            = $data['soat_number'];
        if (isset($data['soat_expiration_date']))   $updateData['soat_expiration_date']   = $data['soat_expiration_date'];
        if (isset($data['soat_document_url'])) {
            $updateData['soat_document_url'] = $data['soat_document_url'];
            // Actualizar timestamp de subida sólo cuando cambia la URL del documento
            if (!empty($data['soat_document_url'])) {
                $updateData['soat_uploaded_at'] = date('Y-m-d H:i:s');
            }
        }

        // ---- Actualización de campos Tecnomecánica ----
        if (isset($data['tecnomecanica_number']))           $updateData['tecnomecanica_number']            = $data['tecnomecanica_number'];
        if (isset($data['tecnomecanica_expiration_date']))  $updateData['tecnomecanica_expiration_date']   = $data['tecnomecanica_expiration_date'];
        if (isset($data['tecnomecanica_document_url'])) {
            $updateData['tecnomecanica_document_url'] = $data['tecnomecanica_document_url'];
            if (!empty($data['tecnomecanica_document_url'])) {
                $updateData['tecnomecanica_uploaded_at'] = date('Y-m-d H:i:s');
            }
        }

        // ---- Validación de estado: bloquear reactivación con documentos vencidos ----
        if (isset($data['status'])) {
            if ($data['status'] === 'active') {
                // Usar las fechas que ya están en BD, salvo que se estén actualizando ahora mismo
                $soatExpiry = $updateData['soat_expiration_date']
                    ?? $vehicle['soat_expiration_date'];
                $tecnoExpiry = $updateData['tecnomecanica_expiration_date']
                    ?? $vehicle['tecnomecanica_expiration_date'];

                $today = date('Y-m-d');

                // Si el SOAT ya venció no se puede reactivar el vehículo
                if (!empty($soatExpiry) && $soatExpiry < $today) {
                    throw new \Exception(
                        'No se puede activar el vehículo: el SOAT está vencido (' . $soatExpiry . '). ' .
                        'Actualice el documento antes de reactivar.'
                    );
                }

                // Si la tecnomecánica ya venció tampoco se puede reactivar
                if (!empty($tecnoExpiry) && $tecnoExpiry < $today) {
                    throw new \Exception(
                        'No se puede activar el vehículo: la tecnomecánica está vencida (' . $tecnoExpiry . '). ' .
                        'Actualice el documento antes de reactivar.'
                    );
                }
            }
            $updateData['status'] = $data['status'];
        }

        // ---- is_primary ----
        if (isset($data['is_primary']) && $data['is_primary']) {
            // Desmarcar los demás vehículos del usuario antes de marcar este
            Database::update(
                'vehicles',
                ['is_primary' => false],
                'user_id = ? AND id != ?',
                [$userId, $vehicleId]
            );
            $updateData['is_primary'] = true;
        }

        // Nada que actualizar
        if (empty($updateData)) {
            return true;
        }

        $rowCount = Database::update('vehicles', $updateData, 'id = ?', [$vehicleId]);
        return $rowCount > 0;
    }

    // =========================================================================
    // delete()
    // =========================================================================

    /**
     * Soft-delete de un vehículo.
     *
     * No elimina la fila: marca deleted_at y cambia el status a 'inactive'.
     * Si era el vehículo principal, intenta promover otro como principal.
     *
     * @param int $vehicleId
     * @param int $userId
     * @return bool
     * @throws \Exception
     */
    public function delete(int $vehicleId, int $userId): bool
    {
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

        $rowCount = Database::update('vehicles', [
            'status'     => 'inactive',
            'deleted_at' => date('Y-m-d H:i:s'),
        ], 'id = ?', [$vehicleId]);

        // Si era el principal, promover el vehículo activo más antiguo
        if ($vehicle['is_primary']) {
            $another = Database::fetchOne(
                'SELECT id FROM vehicles
                 WHERE user_id = ? AND deleted_at IS NULL AND id != ?
                 ORDER BY created_at ASC LIMIT 1',
                [$userId, $vehicleId]
            );
            if ($another !== null) {
                Database::update('vehicles', ['is_primary' => true], 'id = ?', [$another['id']]);
            }
        }

        return $rowCount > 0;
    }

    // =========================================================================
    // setPrimary()
    // =========================================================================

    /**
     * Establece un vehículo como el principal del usuario.
     *
     * @param int $vehicleId
     * @param int $userId
     * @return bool
     * @throws \Exception
     */
    public function setPrimary(int $vehicleId, int $userId): bool
    {
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

        // Desmarcar todos los vehículos del usuario
        Database::update('vehicles', ['is_primary' => false], 'user_id = ?', [$userId]);

        // Marcar solo este
        $rowCount = Database::update('vehicles', ['is_primary' => true], 'id = ?', [$vehicleId]);
        return $rowCount > 0;
    }

    // =========================================================================
    // getById()
    // =========================================================================

    /**
     * Recupera un vehículo por ID verificando la propiedad del usuario.
     *
     * Retorna todos los campos, incluyendo los de SOAT y tecnomecánica.
     * El controlador puede agregarle el campo calculado 'documentStatus' si lo necesita.
     *
     * @param int $vehicleId
     * @param int $userId
     * @return array|null
     */
    public function getById(int $vehicleId, int $userId): ?array
    {
        return Database::fetchOne(
            'SELECT * FROM vehicles WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
            [$vehicleId, $userId]
        );
    }

    // =========================================================================
    // getUserVehicles()
    // =========================================================================

    /**
     * Lista todos los vehículos del usuario.
     *
     * @param int  $userId
     * @param bool $activeOnly Si true (por defecto) solo devuelve status='active'
     * @return array
     */
    public function getUserVehicles(int $userId, bool $activeOnly = true): array
    {
        $sql    = 'SELECT * FROM vehicles WHERE user_id = ? AND deleted_at IS NULL';
        $params = [$userId];

        if ($activeOnly) {
            $sql    .= ' AND status = ?';
            $params[] = 'active';
        }

        // Primero el vehículo principal, luego por fecha de creación más reciente
        $sql .= ' ORDER BY is_primary DESC, created_at DESC';

        return Database::fetchAll($sql, $params);
    }

    // =========================================================================
    // getPrimaryVehicle()
    // =========================================================================

    /**
     * Retorna el vehículo principal activo del usuario, o null si no tiene.
     *
     * @param int $userId
     * @return array|null
     */
    public function getPrimaryVehicle(int $userId): ?array
    {
        return Database::fetchOne(
            'SELECT * FROM vehicles
             WHERE user_id = ? AND is_primary = TRUE AND deleted_at IS NULL AND status = ?',
            [$userId, 'active']
        );
    }
}
