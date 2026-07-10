<?php

namespace App\Infrastructure\Http;

use App\Core\Request;

/**
 * Validador de Direcciones IP
 *
 * Proporciona utilidades de extracción y validación de direcciones IP para solicitudes HTTP:
 * - Extraer IP del encabezado X-Forwarded-For (para solicitudes a través de proxy)
 * - Extraer IP de REMOTE_ADDR (conexiones directas)
 * - Manejar múltiples IPs en X-Forwarded-For (usar la primera IP)
 * - Proveer un valor de respaldo para IPs inválidas (0.0.0.0)
 * - Validar el formato de la dirección IP
 *
 * Requisitos: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7
 */
class IPValidator
{
    /**
     * Dirección IP de respaldo para casos inválidos
     */
    private const FALLBACK_IP = '0.0.0.0';

    /**
     * Obtiene la dirección IP del cliente desde la solicitud
     *
     * Verifica primero el encabezado X-Forwarded-For (para solicitudes con proxy),
     * luego recurre a REMOTE_ADDR (conexiones directas).
     *
     * Requisitos: 20.1, 20.2, 20.3
     *
     * @param Request $request Objeto de solicitud HTTP
     * @return string Dirección IP del cliente
     */
    public static function getClientIP(Request $request): string
    {
        // Requisito 20.1: Verificar primero el encabezado X-Forwarded-For
        $forwardedFor = $request->header('X-Forwarded-For');

        if ($forwardedFor !== null && $forwardedFor !== '') {
            // Requisito 20.3: Manejar múltiples IPs (usar la primera IP de la cadena)
            $ips = explode(',', $forwardedFor);
            $ip = trim($ips[0]);

            // Validar la IP extraída
            if (self::isValidIP($ip)) {
                return $ip;
            }
        }

        // Requisito 20.2: Recurrir a REMOTE_ADDR
        $remoteAddr = $request->ip();

        // Validar REMOTE_ADDR
        if (self::isValidIP($remoteAddr)) {
            return $remoteAddr;
        }

        // Requisito 20.4: Retornar el valor de respaldo para IP inválida
        return self::FALLBACK_IP;
    }

    /**
     * Valida el formato de una dirección IP
     *
     * Soporta tanto direcciones IPv4 como IPv6.
     *
     * Requisito 20.5
     *
     * @param string $ip Dirección IP a validar
     * @return bool Verdadero si el formato de IP es válido, falso en caso contrario
     */
    public static function isValidIP(string $ip): bool
    {
        // Verificar cadenas vacías o con solo espacios
        if (empty(trim($ip))) {
            return false;
        }

        // Validar el formato IPv4 o IPv6
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }

    /**
     * Extrae la IP del encabezado X-Forwarded-For
     *
     * Retorna la primera IP de la cadena X-Forwarded-For,
     * o nulo si el encabezado no está presente.
     *
     * Requisito 20.1
     *
     * @param Request $request Objeto de solicitud HTTP
     * @return string|null Primera IP del encabezado X-Forwarded-For o nulo
     */
    public static function getForwardedIP(Request $request): ?string
    {
        $forwardedFor = $request->header('X-Forwarded-For');

        if ($forwardedFor === null || $forwardedFor === '') {
            return null;
        }

        // Manejar múltiples IPs (usar la primera IP)
        $ips = explode(',', $forwardedFor);
        $ip = trim($ips[0]);

        return self::isValidIP($ip) ? $ip : null;
    }

    /**
     * Extrae la IP de REMOTE_ADDR
     *
     * Retorna la dirección IP de la conexión directa.
     *
     * Requisito 20.2
     *
     * @param Request $request Objeto de solicitud HTTP
     * @return string|null IP de REMOTE_ADDR o nulo si es inválida
     */
    public static function getRemoteIP(Request $request): ?string
    {
        $remoteAddr = $request->ip();

        return self::isValidIP($remoteAddr) ? $remoteAddr : null;
    }

    /**
     * Obtiene todas las IPs del encabezado X-Forwarded-For
     *
     * Retorna un arreglo con todas las IPs de la cadena de reenvío.
     * Útil para registro y análisis de seguridad.
     *
     * Requisito 20.3
     *
     * @param Request $request Objeto de solicitud HTTP
     * @return array Arreglo de direcciones IP del encabezado X-Forwarded-For
     */
    public static function getAllForwardedIPs(Request $request): array
    {
        $forwardedFor = $request->header('X-Forwarded-For');

        if ($forwardedFor === null || $forwardedFor === '') {
            return [];
        }

        // Dividir por coma y eliminar espacios en blanco
        $ips = array_map('trim', explode(',', $forwardedFor));

        // Filtrar las IPs inválidas
        return array_filter($ips, [self::class, 'isValidIP']);
    }

    /**
     * Obtiene la dirección IP con metadatos
     *
     * Retorna información detallada sobre la IP del cliente que incluye:
     * - ip: La dirección IP del cliente
     * - source: Origen de la IP ('x-forwarded-for', 'remote-addr' o 'fallback')
     * - forwarded_chain: Arreglo de todas las IPs en X-Forwarded-For (si está presente)
     *
     * Requisitos: 20.1, 20.2, 20.3, 20.4, 20.6, 20.7
     *
     * @param Request $request Objeto de solicitud HTTP
     * @return array Metadatos de la IP
     */
    public static function getIPMetadata(Request $request): array
    {
        $forwardedIP = self::getForwardedIP($request);
        $remoteIP = self::getRemoteIP($request);
        $forwardedChain = self::getAllForwardedIPs($request);

        // Determinar el origen y la IP
        if ($forwardedIP !== null) {
            return [
                'ip' => $forwardedIP,
                'source' => 'x-forwarded-for',
                'forwarded_chain' => $forwardedChain,
                'remote_addr' => $remoteIP
            ];
        }

        if ($remoteIP !== null) {
            return [
                'ip' => $remoteIP,
                'source' => 'remote-addr',
                'forwarded_chain' => [],
                'remote_addr' => $remoteIP
            ];
        }

        // Caso de respaldo
        return [
            'ip' => self::FALLBACK_IP,
            'source' => 'fallback',
            'forwarded_chain' => [],
            'remote_addr' => $request->ip()
        ];
    }

    /**
     * Verifica si la dirección IP ha cambiado entre solicitudes
     *
     * Útil para detectar intentos de secuestro de sesión.
     *
     * Requisito 20.7
     *
     * @param string $previousIP Dirección IP anterior
     * @param string $currentIP Dirección IP actual
     * @return bool Verdadero si la IP ha cambiado, falso en caso contrario
     */
    public static function hasIPChanged(string $previousIP, string $currentIP): bool
    {
        // Normalizar las IPs (eliminar espacios en blanco)
        $previousIP = trim($previousIP);
        $currentIP = trim($currentIP);

        // Comparar las IPs
        return $previousIP !== $currentIP;
    }
}
