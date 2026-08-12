<?php

namespace App\Models\Auth;

use App\Core\Database;
use Exception;

class PasswordResetService
{
    /**
     * Generar un token de recuperación de contraseña
     */
    public function generateResetToken(int $userId): string
    {
        // Generar token aleatorio seguro
        $token = bin2hex(random_bytes(32));
        
        // Token expira en 24 horas
        $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60));
        
        // Guardar token en BD
        Database::insert('password_reset_tokens', [
            'user_id' => $userId,
            'token' => $token,
            'expires_at' => $expiresAt,
        ]);
        
        return $token;
    }

    /**
     * Validar que el token sea válido y no haya expirado
     */
    public function validateToken(string $token): ?int
    {
        $result = Database::fetchOne(
            'SELECT id, user_id, expires_at, used_at 
             FROM password_reset_tokens 
             WHERE token = ? 
             LIMIT 1',
            [$token]
        );
        
        if (!$result) {
            return null; // Token no existe
        }
        
        // Verificar que no esté usado
        if ($result['used_at']) {
            return null; // Token ya fue usado
        }
        
        // Verificar que no haya expirado
        if (strtotime($result['expires_at']) < time()) {
            return null; // Token expirado
        }
        
        return (int)$result['user_id'];
    }

    /**
     * Resetear la contraseña con un token válido
     */
    public function resetPassword(string $token, string $newPassword): bool
    {
        // Validar el token
        $userId = $this->validateToken($token);
        
        if ($userId === null) {
            throw new Exception('Token inválido o expirado');
        }
        
        // Hashear la nueva contraseña
        $passwordHash = password_hash($newPassword, PASSWORD_ARGON2ID);
        
        try {
            // Actualizar contraseña del usuario
            Database::update(
                'users',
                ['password_hash' => $passwordHash, 'updated_at' => date('Y-m-d H:i:s')],
                'id = ?',
                [$userId]
            );
            
            // Marcar el token como usado
            Database::update(
                'password_reset_tokens',
                ['used_at' => date('Y-m-d H:i:s')],
                'token = ?',
                [$token]
            );
            
            // Invalidar todas las sesiones activas del usuario
            Database::query(
                'DELETE FROM sessions WHERE user_id = ?',
                [$userId]
            );
            
            return true;
        } catch (Exception $e) {
            throw new Exception('Error al resetear la contraseña: ' . $e->getMessage());
        }
    }

    /**
     * Limpiar tokens expirados (ejecutar periódicamente)
     */
    public function cleanExpiredTokens(): int
    {
        $result = Database::query(
            'DELETE FROM password_reset_tokens WHERE expires_at < NOW()',
            []
        );
        
        return $result;
    }

    /**
     * Buscar usuario por email
     */
    public function getUserByEmail(string $email): ?array
    {
        return Database::fetchOne(
            'SELECT id, email, first_name, last_name FROM users WHERE email = ? AND account_status = "active"',
            [$email]
        );
    }
}
