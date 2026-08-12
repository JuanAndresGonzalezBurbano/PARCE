<?php

use App\Core\Migration;
use App\Core\Database;

class CreatePasswordResetTokensTable extends Migration
{
    public function up(): void
    {
        $sql = '
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                user_id BIGINT UNSIGNED NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                used_at TIMESTAMP NULL DEFAULT NULL,
                
                KEY idx_user_id (user_id),
                KEY idx_token (token),
                KEY idx_expires_at (expires_at),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ';
        
        Database::raw($sql);
    }

    public function down(): void
    {
        Database::raw('DROP TABLE IF EXISTS password_reset_tokens');
    }
}
