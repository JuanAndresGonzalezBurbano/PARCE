<?php

namespace App\Core;

use PDO;
use PDOException;

/**
 * Database Class
 * 
 * Manages database connections using PDO with connection pooling support.
 * Provides query builder methods and transaction support.
 * Includes connection validation, retry logic, and health checks.
 */
class Database
{
    private static ?PDO $connection = null;
    private static array $config = [];
    private static int $maxRetries = 3;
    private static int $retryDelay = 1000; // milliseconds
    private static ?string $lastError = null;
    private static bool $healthCheckPassed = false;

    /**
     * Set database configuration
     */
    public static function setConfig(array $config): void
    {
        self::$config = $config;
        self::$healthCheckPassed = false;
    }

    /**
     * Get PDO connection (singleton pattern)
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            self::connect();
        }

        return self::$connection;
    }

    /**
     * Establish database connection with retry logic
     */
    private static function connect(): void
    {
        $driver = self::$config['driver'] ?? 'mysql';
        $host = self::$config['host'] ?? '127.0.0.1';
        $port = self::$config['port'] ?? 3306;
        $database = self::$config['database'] ?? '';
        $username = self::$config['username'] ?? 'root';
        $password = self::$config['password'] ?? '';
        $charset = self::$config['charset'] ?? 'utf8mb4';

        $dsn = "{$driver}:host={$host};port={$port};dbname={$database};charset={$charset}";

        $attempt = 0;
        $lastException = null;

        while ($attempt < self::$maxRetries) {
            try {
                self::$connection = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_PERSISTENT => true, // Connection pooling
                    PDO::ATTR_TIMEOUT => 5, // Connection timeout
                ]);

                self::$lastError = null;
                self::$healthCheckPassed = true;
                self::logConnection('success', $host, $database);
                return;

            } catch (PDOException $e) {
                $attempt++;
                $lastException = $e;
                self::$lastError = $e->getMessage();

                self::logConnection('failed', $host, $database, $e->getMessage(), $attempt);

                if ($attempt < self::$maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    $delay = self::$retryDelay * pow(2, $attempt - 1);
                    usleep($delay * 1000);
                }
            }
        }

        // All retries failed
        self::$healthCheckPassed = false;
        throw new DatabaseException(
            "Database connection failed after " . self::$maxRetries . " attempts: " . $lastException->getMessage(),
            (int) $lastException->getCode(),
            $lastException
        );
    }

    /**
     * Execute raw query
     */
    public static function query(string $sql, array $params = []): \PDOStatement
    {
        try {
            $connection = self::getConnection();
            $statement = $connection->prepare($sql);
            $statement->execute($params);
            return $statement;
        } catch (PDOException $e) {
            self::logQuery('failed', $sql, $params, $e->getMessage());
            throw new DatabaseException(
                "Query execution failed: " . $e->getMessage(),
                (int) $e->getCode(),
                $e
            );
        }
    }

    /**
     * Fetch all rows
     */
    public static function fetchAll(string $sql, array $params = []): array
    {
        $statement = self::query($sql, $params);
        return $statement->fetchAll();
    }

    /**
     * Fetch single row
     */
    public static function fetchOne(string $sql, array $params = []): ?array
    {
        $statement = self::query($sql, $params);
        $result = $statement->fetch();
        return $result ?: null;
    }


    /**
     * Insert record and return last insert ID
     */
    public static function insert(string $table, array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        
        self::query($sql, array_values($data));
        
        return (int) self::getConnection()->lastInsertId();
    }

    /**
     * Update records
     */
    public static function update(string $table, array $data, string $where, array $whereParams = []): int
    {
        $set = [];
        foreach (array_keys($data) as $column) {
            $set[] = "{$column} = ?";
        }
        $setClause = implode(', ', $set);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        
        $params = array_merge(array_values($data), $whereParams);
        $statement = self::query($sql, $params);
        
        return $statement->rowCount();
    }

    /**
     * Delete records
     */
    public static function delete(string $table, string $where, array $whereParams = []): int
    {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $statement = self::query($sql, $whereParams);
        return $statement->rowCount();
    }

    /**
     * Begin transaction
     */
    public static function beginTransaction(): bool
    {
        return self::getConnection()->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public static function commit(): bool
    {
        return self::getConnection()->commit();
    }

    /**
     * Rollback transaction
     */
    public static function rollback(): bool
    {
        return self::getConnection()->rollBack();
    }

    /**
     * Check if in transaction
     */
    public static function inTransaction(): bool
    {
        return self::getConnection()->inTransaction();
    }

    /**
     * Close connection
     */
    public static function disconnect(): void
    {
        self::$connection = null;
        self::$healthCheckPassed = false;
    }

    /**
     * Perform health check
     */
    public static function healthCheck(): array
    {
        $startTime = microtime(true);
        $status = 'healthy';
        $message = 'Database connection is operational';
        $details = [];

        try {
            // Test connection
            $connection = self::getConnection();
            
            // Test simple query
            $statement = $connection->query('SELECT 1 as test');
            $result = $statement->fetch();
            
            if ($result['test'] !== 1) {
                throw new \Exception('Health check query returned unexpected result');
            }

            // Get server info
            $details['driver'] = self::$config['driver'] ?? 'unknown';
            $details['host'] = self::$config['host'] ?? 'unknown';
            $details['database'] = self::$config['database'] ?? 'unknown';
            $details['server_version'] = $connection->getAttribute(PDO::ATTR_SERVER_VERSION);
            $details['connection_status'] = $connection->getAttribute(PDO::ATTR_CONNECTION_STATUS);

        } catch (\Throwable $e) {
            $status = 'unhealthy';
            $message = 'Database health check failed: ' . $e->getMessage();
            $details['error'] = $e->getMessage();
            $details['last_error'] = self::$lastError;
        }

        $responseTime = round((microtime(true) - $startTime) * 1000, 2);
        $details['response_time_ms'] = $responseTime;

        return [
            'status' => $status,
            'message' => $message,
            'details' => $details,
        ];
    }

    /**
     * Check if connection is alive
     */
    public static function isConnected(): bool
    {
        if (self::$connection === null) {
            return false;
        }

        try {
            self::$connection->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * Get last error message
     */
    public static function getLastError(): ?string
    {
        return self::$lastError;
    }

    /**
     * Log connection attempt
     */
    private static function logConnection(string $status, string $host, string $database, ?string $error = null, int $attempt = 1): void
    {
        $logDir = __DIR__ . '/../../storage/logs';
        
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }

        $logFile = $logDir . '/database-' . date('Y-m-d') . '.log';
        
        $message = sprintf(
            "[%s] Connection %s: host=%s, database=%s, attempt=%d",
            date('Y-m-d H:i:s'),
            $status,
            $host,
            $database,
            $attempt
        );

        if ($error) {
            $message .= ", error=" . $error;
        }

        $message .= "\n";
        
        @file_put_contents($logFile, $message, FILE_APPEND);
    }

    /**
     * Log query execution
     */
    private static function logQuery(string $status, string $sql, array $params, ?string $error = null): void
    {
        $logDir = __DIR__ . '/../../storage/logs';
        
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }

        $logFile = $logDir . '/database-' . date('Y-m-d') . '.log';
        
        $message = sprintf(
            "[%s] Query %s: %s",
            date('Y-m-d H:i:s'),
            $status,
            $sql
        );

        if (!empty($params)) {
            $message .= ", params=" . json_encode($params);
        }

        if ($error) {
            $message .= ", error=" . $error;
        }

        $message .= "\n";
        
        @file_put_contents($logFile, $message, FILE_APPEND);
    }
}
