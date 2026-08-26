<?php

namespace Tests\Unit\Support;

use App\Core\Request;
use App\Core\Response;
use ReflectionProperty;

/**
 * Helper compartido para tests unitarios de Controllers/Middleware.
 *
 * App\Core\Request lee las superglobales reales ($_GET/$_POST/$_SERVER/
 * $_COOKIE) directamente en su constructor — no es inyectable por parámetros.
 * makeRequest() las fija ANTES de construirlo, mismo patrón ya usado en
 * VehicleValidatorTest para Validators. Verificado que activar
 * HTTP_CONTENT_TYPE=application/json no bloquea ni falla en el proceso CLI de
 * PHPUnit: Request::isJson() intenta leer php://input (vacío en CLI),
 * json_decode('') da null, y `null ?? []` dejan $this->json como arreglo
 * vacío — Request::input() cae correctamente a $_POST/$_GET, nunca intercepta
 * con un valor falso desde el JSON vacío.
 *
 * App\Core\Response::$content (el JSON ya codificado) es una propiedad
 * PRIVADA sin getter público — responseBody() lo lee vía Reflection, la única
 * forma nativa de inspeccionarlo sin pasar por send()/output buffering.
 */
trait SimulatesHttp
{
    private array $serverBackup;
    private array $postBackup;
    private array $getBackup;
    private array $cookieBackup;

    protected function backupSuperglobals(): void
    {
        $this->serverBackup = $_SERVER;
        $this->postBackup   = $_POST;
        $this->getBackup    = $_GET;
        $this->cookieBackup = $_COOKIE;
    }

    protected function restoreSuperglobals(): void
    {
        $_SERVER = $this->serverBackup;
        $_POST   = $this->postBackup;
        $_GET    = $this->getBackup;
        $_COOKIE = $this->cookieBackup;
    }

    /**
     * Construye un Request real simulando una petición HTTP.
     *
     * @param string $method     Método HTTP (GET, POST, PUT, ...)
     * @param array  $body       Datos de body — llegan por $_POST (leídos por
     *                           Request::input() igual que un body JSON real)
     * @param array  $query      Parámetros de query string ($_GET)
     * @param array  $cookies    Cookies ($_COOKIE)
     * @param array  $attributes Atributos ya resueltos por middleware (userId,
     *                           userRole, user, etc.) — para probar un
     *                           Controller/Middleware más adelante en la cadena
     *                           sin tener que ejecutar los anteriores
     * @param bool   $asJson     Si true (por defecto) y el método no es GET/OPTIONS,
     *                           fija Content-Type: application/json (pasa
     *                           RequestValidator::validateContentType())
     * @param array  $headers    Cabeceras adicionales, formato ['Origin' => '...']
     */
    protected function makeRequest(
        string $method = 'GET',
        array $body = [],
        array $query = [],
        array $cookies = [],
        array $attributes = [],
        bool $asJson = true,
        array $headers = []
    ): Request {
        $_SERVER['REQUEST_METHOD'] = $method;

        if ($asJson && !in_array(strtoupper($method), ['GET', 'OPTIONS'], true)) {
            $_SERVER['HTTP_CONTENT_TYPE'] = 'application/json';
        } else {
            unset($_SERVER['HTTP_CONTENT_TYPE']);
        }

        foreach ($headers as $name => $value) {
            $_SERVER['HTTP_' . strtoupper(str_replace('-', '_', $name))] = $value;
        }

        $_POST   = $body;
        $_GET    = $query;
        $_COOKIE = $cookies;

        $request = new Request();
        foreach ($attributes as $key => $value) {
            $request->setAttribute($key, $value);
        }

        return $request;
    }

    /**
     * Decodifica el cuerpo JSON de un Response real (Response::$content es
     * privado, sin getter público) vía Reflection.
     */
    protected function responseBody(Response $response): array
    {
        $ref = new ReflectionProperty($response, 'content');
        $ref->setAccessible(true);

        return json_decode($ref->getValue($response) ?? '', true) ?? [];
    }

    /**
     * Lee un header ya fijado en un Response real (Response::$headers también
     * es privado, sin getter público) vía Reflection — usado para verificar
     * cookies de sesión (Set-Cookie) que ResponseFormatter::setSessionCookie()
     * fija como header además de vía setCookie().
     */
    protected function responseHeader(Response $response, string $name): ?string
    {
        $ref = new ReflectionProperty($response, 'headers');
        $ref->setAccessible(true);

        return $ref->getValue($response)[$name] ?? null;
    }
}
