<?php

namespace App\Core;

/**
 * Carga variables de entorno desde un archivo .env hacia $_ENV/putenv().
 *
 * Extraído de tres copias idénticas de este mismo bucle de parseo
 * (App::loadEnvironment(), migrate_run.php, scripts/maintenance/migrate.php).
 * No decide qué hacer si el archivo no existe — cada llamador conserva su
 * propio manejo de ese caso (lanzar en producción, salir con mensaje
 * coloreado, etc.), ya que ese comportamiento difiere entre contexto web y
 * CLI y no se debe unificar.
 */
class EnvLoader
{
    /**
     * Parsea el archivo .env indicado y aplica sus variables a $_ENV/putenv().
     *
     * @param string $path Ruta absoluta al archivo .env
     * @return bool Verdadero si el archivo existía y se cargó, falso si no existe
     */
    public static function load(string $path): bool
    {
        if (!file_exists($path)) {
            return false;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            if (strpos($line, '=') === false) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            $value = trim($value, '"\'');

            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }

        return true;
    }
}
