<?php

namespace App\Core;

/**
 * Clase de petición HTTP
 *
 * Gestiona los datos de la petición HTTP y provee acceso limpio a su información.
 * Compatible con peticiones web tradicionales y peticiones de API.
 */
class Request
{
    private array $query;
    private array $post;
    private array $server;
    private array $cookies;
    private array $files;
    private ?array $json = null;
    private array $attributes = [];

    public function __construct()
    {
        $this->query = $_GET;
        $this->post = $_POST;
        $this->server = $_SERVER;
        $this->cookies = $_COOKIE;
        $this->files = $_FILES;

        // Parsear el cuerpo JSON si el Content-Type es application/json
        if ($this->isJson()) {
            $this->json = json_decode(file_get_contents('php://input'), true) ?? [];
        }
    }

    /**
     * Retorna el método HTTP de la petición (GET, POST, PUT, DELETE, etc.)
     */
    public function method(): string
    {
        return strtoupper($this->server['REQUEST_METHOD'] ?? 'GET');
    }

    /**
     * Retorna la URI de la petición sin la cadena de consulta (query string)
     */
    public function uri(): string
    {
        $uri = $this->server['REQUEST_URI'] ?? '/';
        
        // Remover query string
        $uri = strtok($uri, '?');
        
        // Fix backslashes on Windows
        $uri = str_replace('\\', '/', $uri);
        
        // Para php -S (servidor nativo), la URI ya es correcta (/api/auth/forgot-password)
        // Para Apache, podría ser /PARCE/public/index.php/api/auth/forgot-password
        // Entonces, extraer la parte después de index.php si existe
        if (strpos($uri, 'index.php') !== false) {
            $parts = explode('index.php', $uri);
            if (isset($parts[1])) {
                $uri = $parts[1];
            }
        }
        
        // Remover /PARCE/public si está al inicio
        if (strpos($uri, '/PARCE/public') === 0) {
            $uri = substr($uri, strlen('/PARCE/public'));
        }
        
        // Asegurar que empieza con /
        if (empty($uri) || $uri[0] !== '/') {
            $uri = '/' . $uri;
        }
        
        return $uri;
    }

    /**
     * Retorna la URL completa de la petición
     */
    public function url(): string
    {
        $protocol = $this->isSecure() ? 'https' : 'http';
        $host = $this->server['HTTP_HOST'] ?? 'localhost';
        return $protocol . '://' . $host . $this->uri();
    }


    /**
     * Indica si la petición fue realizada mediante HTTPS
     */
    public function isSecure(): bool
    {
        return !empty($this->server['HTTPS']) && $this->server['HTTPS'] !== 'off';
    }

    /**
     * Indica si el cliente espera una respuesta en formato JSON
     */
    public function expectsJson(): bool
    {
        return $this->isJson() ||
               str_contains($this->header('Accept', ''), 'application/json');
    }

    /**
     * Indica si el Content-Type de la petición es application/json
     */
    public function isJson(): bool
    {
        return str_contains($this->header('Content-Type', ''), 'application/json');
    }

    /**
     * Obtiene un valor de entrada buscando en el cuerpo JSON, POST y query string (en ese orden)
     */
    public function input(string $key, mixed $default = null): mixed
    {
        // Buscar primero en el cuerpo JSON (peticiones de API)
        if ($this->json !== null && array_key_exists($key, $this->json)) {
            return $this->json[$key];
        }

        // Buscar en los datos POST
        if (array_key_exists($key, $this->post)) {
            return $this->post[$key];
        }

        // Buscar en la cadena de consulta (query string)
        if (array_key_exists($key, $this->query)) {
            return $this->query[$key];
        }

        return $default;
    }

    /**
     * Retorna todos los datos de entrada combinados (query, POST y JSON)
     */
    public function all(): array
    {
        return array_merge($this->query, $this->post, $this->json ?? []);
    }

    /**
     * Retorna únicamente las claves indicadas de los datos de entrada
     */
    public function only(array $keys): array
    {
        $data = [];
        foreach ($keys as $key) {
            $data[$key] = $this->input($key);
        }
        return $data;
    }

    /**
     * Retorna todos los datos de entrada excepto las claves indicadas
     */
    public function except(array $keys): array
    {
        $data = $this->all();
        foreach ($keys as $key) {
            unset($data[$key]);
        }
        return $data;
    }


    /**
     * Obtiene un parámetro de la cadena de consulta (query string)
     */
    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    /**
     * Obtiene el valor de un encabezado HTTP
     */
    public function header(string $key, mixed $default = null): mixed
    {
        // En Apache/CGI, algunos headers no tienen el prefijo HTTP_
        // Content-Type se guarda como CONTENT_TYPE
        // Content-Length se guarda como CONTENT_LENGTH
        $specialHeaders = ['Content-Type', 'Content-Length'];
        
        if (in_array($key, $specialHeaders)) {
            $specialKey = strtoupper(str_replace('-', '_', $key));
            if (isset($this->server[$specialKey])) {
                return $this->server[$specialKey];
            }
        }
        
        // Para otros headers, usar el prefijo HTTP_
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
        return $this->server[$key] ?? $default;
    }

    /**
     * Obtiene el valor de una cookie
     */
    public function cookie(string $key, mixed $default = null): mixed
    {
        return $this->cookies[$key] ?? $default;
    }

    /**
     * Obtiene el arreglo de datos de un archivo subido
     */
    public function file(string $key): ?array
    {
        return $this->files[$key] ?? null;
    }

    /**
     * Retorna la dirección IP del cliente
     */
    public function ip(): string
    {
        return $this->server['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Retorna el User-Agent del cliente
     */
    public function userAgent(): string
    {
        return $this->server['HTTP_USER_AGENT'] ?? '';
    }

    /**
     * Establece un atributo personalizado en la petición (usado por middleware)
     */
    public function setAttribute(string $key, mixed $value): void
    {
        $this->attributes[$key] = $value;
    }

    /**
     * Obtiene un atributo personalizado de la petición
     */
    public function getAttribute(string $key, mixed $default = null): mixed
    {
        return $this->attributes[$key] ?? $default;
    }

    /**
     * Indica si la clave especificada existe en los datos de entrada
     */
    public function has(string $key): bool
    {
        return $this->input($key) !== null;
    }

    /**
     * Valida que los campos requeridos estén presentes en los datos de entrada
     */
    public function validate(array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $rule) {
            if ($rule === 'required' && !$this->has($field)) {
                $errors[$field] = "The {$field} field is required.";
            }
        }

        return $errors;
    }
}
