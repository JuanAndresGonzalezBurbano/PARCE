<?php

use App\Core\Migration;

/**
 * Create Password Reset Tokens Table Migration
 *
 * Soporta el flujo de "olvidé mi contraseña": un token de un solo uso,
 * de vida corta, enviado por correo. Solo se guarda el hash SHA-256 del
 * token (no el token en texto plano) — si la base de datos se filtra, los
 * enlaces de reseteo activos no quedan directamente utilizables, igual que
 * ya se hace con password_hash para las contraseñas de usuario.
 *
 * expires_at lleva un DEFAULT explícito (sentinel, siempre se sobreescribe
 * en el INSERT): sin esto, al ser la primera columna TIMESTAMP de la tabla,
 * MySQL le asigna automáticamente el comportamiento legacy
 * 'ON UPDATE CURRENT_TIMESTAMP', lo que extendería silenciosamente la
 * expiración del token ante cualquier UPDATE de la fila (ej. marcar used_at).
 */
class CreatePasswordResetTokensTable extends Migration
{
    /**
     * Run the migration
     */
    public function up(): void
    {
        $this->execute("
            CREATE TABLE password_reset_tokens (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT UNSIGNED NOT NULL,
                token_hash VARCHAR(64) NOT NULL,
                ip_address VARCHAR(45) NULL,
                expires_at TIMESTAMP NOT NULL DEFAULT '2000-01-01 00:00:00',
                used_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                INDEX idx_user_id (user_id),
                INDEX idx_token_hash (token_hash),
                INDEX idx_expires_at (expires_at),

                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        $this->dropTable('password_reset_tokens');
    }
}
