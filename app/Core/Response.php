<?php

namespace App\Core;

/**
 * Response Class
 * 
 * Handles HTTP responses for both web views and API JSON responses.
 * Supports status codes, headers, cookies, and content types.
 */
class Response
{
    private int $statusCode = 200;
    private array $headers = [];
    private array $cookies = [];
    private mixed $content = null;

    /**
     * Set HTTP status code
     */
    public function setStatusCode(int $code): self
    {
        $this->statusCode = $code;
        return $this;
    }

    /**
     * Get HTTP status code
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * Set response header
     */
    public function setHeader(string $name, string $value): self
    {
        $this->headers[$name] = $value;
        return $this;
    }

    /**
     * Set multiple headers
     */
    public function setHeaders(array $headers): self
    {
        foreach ($headers as $name => $value) {
            $this->setHeader($name, $value);
        }
        return $this;
    }

    /**
     * Set cookie
     */
    public function setCookie(
        string $name,
        string $value,
        int $expires = 0,
        string $path = '/',
        string $domain = '',
        bool $secure = false,
        bool $httpOnly = true
    ): self {
        $this->cookies[] = [
            'name' => $name,
            'value' => $value,
            'expires' => $expires,
            'path' => $path,
            'domain' => $domain,
            'secure' => $secure,
            'httpOnly' => $httpOnly
        ];
        return $this;
    }

    /**
     * Set response content
     */
    public function setContent(mixed $content): self
    {
        $this->content = $content;
        return $this;
    }


    /**
     * Send JSON response
     */
    public function json(array $data, int $statusCode = 200): self
    {
        $this->statusCode = $statusCode;
        $this->setHeader('Content-Type', 'application/json');
        $this->content = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $this;
    }

    /**
     * Send HTML response
     */
    public function html(string $html, int $statusCode = 200): self
    {
        $this->statusCode = $statusCode;
        $this->setHeader('Content-Type', 'text/html; charset=UTF-8');
        $this->content = $html;
        return $this;
    }

    /**
     * Render view template
     */
    public function view(string $view, array $data = [], int $statusCode = 200): self
    {
        $viewPath = __DIR__ . '/../../app/Views/' . str_replace('.', '/', $view) . '.php';
        
        if (!file_exists($viewPath)) {
            throw new \Exception("View not found: {$view}");
        }

        ob_start();
        extract($data);
        require $viewPath;
        $html = ob_get_clean();

        return $this->html($html, $statusCode);
    }

    /**
     * Redirect to URL
     */
    public function redirect(string $url, int $statusCode = 302): self
    {
        $this->statusCode = $statusCode;
        $this->setHeader('Location', $url);
        return $this;
    }

    /**
     * Send the response
     */
    public function send(): void
    {
        // Set status code
        http_response_code($this->statusCode);

        // Send headers
        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }

        // Send cookies
        foreach ($this->cookies as $cookie) {
            setcookie(
                $cookie['name'],
                $cookie['value'],
                $cookie['expires'],
                $cookie['path'],
                $cookie['domain'],
                $cookie['secure'],
                $cookie['httpOnly']
            );
        }

        // Send content
        if ($this->content !== null) {
            echo $this->content;
        }
    }

    /**
     * Create success JSON response
     */
    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): self
    {
        $response = new self();
        return $response->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    /**
     * Create error JSON response
     */
    public static function error(string $message, mixed $errors = null, int $statusCode = 400): self
    {
        $response = new self();
        return $response->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);
    }
}
