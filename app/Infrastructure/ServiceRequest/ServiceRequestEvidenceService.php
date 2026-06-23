<?php

namespace App\Infrastructure\ServiceRequest;

use App\Core\Database;

/**
 * Service Request Evidence Service
 *
 * Manages photographic evidence (before/during/after) for service requests.
 * Only the assigned mechanic can add evidences.
 * Evidences are stored as URLs with optional metadata.
 *
 * Requirements: 5.1-5.11
 */
class ServiceRequestEvidenceService
{
    private const MAX_FILE_SIZE = 5242880; // 5 MB in bytes
    private const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    private const VALID_EVIDENCE_TYPES = ['before', 'during', 'after'];
    private const VALID_STATUSES = ['assigned', 'in_progress', 'completed'];

    /**
     * Add a photographic evidence record to a service request.
     *
     * @param int   $serviceRequestId
     * @param int   $mechanicId       Authenticated mechanic user ID
     * @param array $data             Keys: evidence_type, image_url, original_filename (optional), file_size (optional)
     * @return array                  Inserted evidence record
     * @throws \Exception             On access or business rule violation
     * @throws \InvalidArgumentException On validation failure
     */
    public function addEvidence(int $serviceRequestId, int $mechanicId, array $data): array
    {
        // 1. Fetch request and verify it exists
        $serviceRequest = Database::fetchOne(
            'SELECT id, mechanic_id, status FROM service_requests WHERE id = ? AND deleted_at IS NULL',
            [$serviceRequestId]
        );

        if ($serviceRequest === null) {
            throw new \Exception('Service request not found.');
        }

        // 2. Verify mechanic assignment
        if ((int)$serviceRequest['mechanic_id'] !== $mechanicId) {
            throw new \Exception('No está asignado a esta solicitud de servicio.');
        }

        // 3. Verify valid status
        if (!in_array($serviceRequest['status'], self::VALID_STATUSES, true)) {
            throw new \Exception(
                'Solo se pueden agregar evidencias a solicitudes en estado assigned, in_progress o completed.'
            );
        }

        // 4. Validate evidence_type
        $evidenceType = $data['evidence_type'] ?? '';
        if (!in_array($evidenceType, self::VALID_EVIDENCE_TYPES, true)) {
            throw new \InvalidArgumentException(
                'evidence_type must be one of: before, during, after.'
            );
        }

        // 5. Validate image_url — required, max 500 chars, must be http/https URL
        $imageUrl = $data['image_url'] ?? '';
        if (empty($imageUrl)
            || strlen($imageUrl) > 500
            || !filter_var($imageUrl, FILTER_VALIDATE_URL)
            || !preg_match('/^https?:\/\//i', $imageUrl)) {
            throw new \InvalidArgumentException(
                'image_url must be a valid http/https URL not exceeding 500 characters.'
            );
        }

        // 6. Validate file extension from URL path
        $urlPath = strtolower(parse_url($imageUrl, PHP_URL_PATH) ?? '');
        $ext = pathinfo($urlPath, PATHINFO_EXTENSION);
        if (!in_array($ext, self::VALID_EXTENSIONS, true)) {
            throw new \InvalidArgumentException(
                'Image URL must point to a file with extension: jpg, jpeg, png, or webp.'
            );
        }

        // 7. Validate file_size if provided
        if (isset($data['file_size']) && $data['file_size'] !== null) {
            if ((int)$data['file_size'] > self::MAX_FILE_SIZE) {
                throw new \InvalidArgumentException(
                    'file_size must not exceed 5242880 bytes (5 MB).'
                );
            }
        }

        // 8. Build insert data
        $insertData = [
            'service_request_id' => $serviceRequestId,
            'uploaded_by'        => $mechanicId,
            'evidence_type'      => $evidenceType,
            'image_url'          => $imageUrl,
        ];

        if (!empty($data['original_filename'])) {
            $insertData['original_filename'] = $data['original_filename'];
        }

        if (isset($data['file_size']) && $data['file_size'] !== null) {
            $insertData['file_size'] = (int)$data['file_size'];
        }

        // 9. Insert record
        $evidenceId = Database::insert('service_request_evidences', $insertData);

        // 10. Return the inserted record
        $evidence = Database::fetchOne(
            'SELECT id, service_request_id, uploaded_by, evidence_type,
                    image_url, original_filename, file_size, created_at
             FROM service_request_evidences
             WHERE id = ?',
            [$evidenceId]
        );

        return $evidence;
    }

    /**
     * Get all evidences for a service request, ordered by creation time.
     *
     * @param int $serviceRequestId
     * @return array
     */
    public function getEvidences(int $serviceRequestId): array
    {
        return Database::fetchAll(
            'SELECT id, uploaded_by, evidence_type, image_url,
                    original_filename, file_size, created_at
             FROM service_request_evidences
             WHERE service_request_id = ?
             ORDER BY created_at ASC',
            [$serviceRequestId]
        );
    }
}
