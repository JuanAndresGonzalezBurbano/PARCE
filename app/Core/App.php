<?php

namespace App\Core;

/**
 * Application Class
 * 
 * Main application bootstrap and lifecycle management.
 * Handles configuration loading, error handling, and request dispatching.
 */
class App
{
    private Router $router;
    private array $config = [];

    public function __construct()
    {
        $this->router = new Router();
        $this->loadEnvironment();
        $this->loadConfiguration();
        $this->setupErrorHandling();
        $this->setupDatabase();
        $this->startSession();
    }

    /**
     * Load environment variables from .env file
     */
    private function loadEnvironment(): void
    {
        $envFile = __DIR__ . '/../../.env';
        
        if (!file_exists($envFile)) {
            // Check if we're in production - .env is required
            if (getenv('APP_ENV') === 'production') {
                throw new \RuntimeException('.env file not found. This is required in production.');
            }
            // In development, warn but continue with defaults
            error_log('WARNING: .env file not found. Using default configuration.');
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parse KEY=VALUE
            if (strpos($line, '=') !== false) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes
                $value = trim($value, '"\'');
                
                $_ENV[$key] = $value;
                putenv("{$key}={$value}");
            }
        }
    }

    /**
     * Load configuration files
     */
    private function loadConfiguration(): void
    {
        $this->config = [
            'app' => [
                'name' => $this->env('APP_NAME', 'P.A.R.C.E'),
                'env' => $this->env('APP_ENV', 'local'),
                'debug' => $this->env('APP_DEBUG', 'true') === 'true',
                'url' => $this->env('APP_URL', 'http://localhost'),
            ],
            'database' => [
                'driver' => $this->env('DB_CONNECTION', 'mysql'),
                'host' => $this->env('DB_HOST', '127.0.0.1'),
                'port' => (int) $this->env('DB_PORT', '3306'),
                'database' => $this->env('DB_DATABASE', 'parce'),
                'username' => $this->env('DB_USERNAME', 'root'),
                'password' => $this->env('DB_PASSWORD', ''),
                'charset' => 'utf8mb4',
            ],
            'session' => [
                'lifetime' => (int) $this->env('SESSION_LIFETIME', '120'),
                'driver' => $this->env('SESSION_DRIVER', 'file'),
            ],
        ];

        // Validate configuration
        $validator = new ConfigValidator();
        if (!$validator->validate($this->config)) {
            $errorMessage = $validator->getErrorMessage();
            
            if ($this->config['app']['debug']) {
                throw new \RuntimeException($errorMessage);
            } else {
                // Log errors and continue with warnings in production
                error_log($errorMessage);
            }
        }

        // Log warnings even if validation passed
        $warnings = $validator->getWarnings();
        if (!empty($warnings)) {
            foreach ($warnings as $warning) {
                error_log("CONFIG WARNING: {$warning}");
            }
        }
    }


    /**
     * Setup global error and exception handling
     */
    private function setupErrorHandling(): void
    {
        error_reporting(E_ALL);
        
        if ($this->config['app']['debug']) {
            ini_set('display_errors', '1');
        } else {
            ini_set('display_errors', '0');
        }

        // Exception handler
        set_exception_handler(function (\Throwable $e) {
            $this->handleException($e);
        });

        // Error handler
        set_error_handler(function ($severity, $message, $file, $line) {
            throw new \ErrorException($message, 0, $severity, $file, $line);
        });

        // Shutdown handler for fatal errors
        register_shutdown_function(function () {
            $error = error_get_last();
            if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
                $this->handleException(new \ErrorException(
                    $error['message'],
                    0,
                    $error['type'],
                    $error['file'],
                    $error['line']
                ));
            }
        });
    }

    /**
     * Handle exceptions
     */
    private function handleException(\Throwable $e): void
    {
        // Log error
        $this->logError($e);

        // Send response
        http_response_code(500);
        
        if ($this->config['app']['debug']) {
            // Show detailed error in debug mode
            echo "<h1>Error</h1>";
            echo "<p><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
            echo "<p><strong>File:</strong> " . htmlspecialchars($e->getFile()) . "</p>";
            echo "<p><strong>Line:</strong> " . $e->getLine() . "</p>";
            echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
        } else {
            // Show generic error in production
            echo "<h1>500 Internal Server Error</h1>";
            echo "<p>Something went wrong. Please try again later.</p>";
        }
        
        exit(1);
    }

    /**
     * Log error to file
     */
    private function logError(\Throwable $e): void
    {
        $logDir = __DIR__ . '/../../storage/logs';
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $logFile = $logDir . '/error-' . date('Y-m-d') . '.log';
        $message = sprintf(
            "[%s] %s: %s in %s:%d\nStack trace:\n%s\n\n",
            date('Y-m-d H:i:s'),
            get_class($e),
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $e->getTraceAsString()
        );
        
        file_put_contents($logFile, $message, FILE_APPEND);
    }

    /**
     * Setup database connection
     */
    private function setupDatabase(): void
    {
        Database::setConfig($this->config['database']);
    }

    /**
     * Start session
     */
    private function startSession(): void
    {
        Session::start();
    }

    /**
     * Get environment variable
     */
    private function env(string $key, mixed $default = null): mixed
    {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }

    /**
     * Get router instance
     */
    public function getRouter(): Router
    {
        return $this->router;
    }

    /**
     * Get configuration value
     */
    public function config(string $key, mixed $default = null): mixed
    {
        $keys = explode('.', $key);
        $value = $this->config;
        
        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }
        
        return $value;
    }

    /**
     * Run the application
     */
    public function run(): void
    {
        $request = new Request();
        $response = $this->router->dispatch($request);
        $response->send();
    }
}
