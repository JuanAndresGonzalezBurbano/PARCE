<?php

namespace App\Infrastructure\MechanicApplication;

use App\Core\Request;

/**
 * Validador de Solicitudes de Mecánico
 *
 * Valida los datos de entrada del flujo de solicitud + revisión administrativa
 * para obtener el rol `mechanic`. Reutiliza el ENUM `status` ya existente en
 * `admin_access_requests` (pending, approved, rejected, cancelled) — no se
 * inventan estados nuevos.
 */
class MechanicApplicationValidator
{
    /**
     * Estados válidos de una solicitud (coincide con el ENUM real de
     * admin_access_requests.status, migración 2024_01_01_000001).
     */
    private const VALID_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

    /**
     * Valida los datos para crear una solicitud de mecánico.
     *
     * @param Request $request Solicitud HTTP
     * @return array           ['valid' => bool, 'errors' => array]
     */
    public static function validateCreateRequest(Request $request): array
    {
        $errors = [];

        $justification = $request->input('justification');
        if (empty($justification) || trim((string)$justification) === '') {
            $errors['justification'] = 'La justificación es requerida';
        } elseif (strlen(trim((string)$justification)) < 20) {
            $errors['justification'] = 'La justificación debe tener al menos 20 caracteres';
        } elseif (strlen($justification) > 2000) {
            $errors['justification'] = 'La justificación no debe superar los 2000 caracteres';
        }

        return [
            'valid'  => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Valida los datos para rechazar una solicitud (administrador).
     *
     * @param Request $request Solicitud HTTP
     * @return array           ['valid' => bool, 'errors' => array]
     */
    public static function validateRejectRequest(Request $request): array
    {
        $errors = [];

        $reason = $request->input('rejection_reason');
        if (empty($reason) || trim((string)$reason) === '') {
            $errors['rejection_reason'] = 'El motivo de rechazo es requerido';
        } elseif (strlen($reason) > 1000) {
            $errors['rejection_reason'] = 'El motivo de rechazo no debe superar los 1000 caracteres';
        }

        return [
            'valid'  => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Retorna los estados válidos de una solicitud.
     *
     * @return array
     */
    public static function getValidStatuses(): array
    {
        return self::VALID_STATUSES;
    }
}
