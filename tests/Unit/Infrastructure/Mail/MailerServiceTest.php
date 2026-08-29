<?php

namespace Tests\Unit\Infrastructure\Mail;

use App\Infrastructure\Mail\MailerService;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitarios de MailerService — PDO mockeado no aplica, no toca la base
 * de datos.
 *
 * BLOQUEO TÉCNICO REAL (reportado, sin resolver — ver informe de esta fase):
 * send() llama curl_init()/curl_setopt_array()/curl_exec()/curl_getinfo()/
 * curl_error()/curl_close() de forma nativa e inline, sin ningún wrapper ni
 * cliente HTTP inyectable — no hay ningún seam existente (ni MocksDatabase ni
 * ningún otro) que pueda interceptar esta llamada. Por eso este archivo SOLO
 * cubre la única rama alcanzable sin tocar cURL en absoluto: cuando
 * RESEND_API_KEY no está configurada, send() retorna false ANTES de
 * construir siquiera el payload — no requiere ningún mock. Las ramas que sí
 * requieren interceptar cURL (éxito, error de red, rechazo de Resend) quedan
 * pendientes de tu decisión — ver el informe de esta fase para las opciones.
 */
class MailerServiceTest extends TestCase
{
    private ?string $apiKeyBackup;
    private ?string $mailFromBackup;

    protected function setUp(): void
    {
        $this->apiKeyBackup = $_ENV['RESEND_API_KEY'] ?? null;
        $this->mailFromBackup = $_ENV['MAIL_FROM'] ?? null;
    }

    protected function tearDown(): void
    {
        if ($this->apiKeyBackup === null) {
            unset($_ENV['RESEND_API_KEY']);
        } else {
            $_ENV['RESEND_API_KEY'] = $this->apiKeyBackup;
        }
        if ($this->mailFromBackup === null) {
            unset($_ENV['MAIL_FROM']);
        } else {
            $_ENV['MAIL_FROM'] = $this->mailFromBackup;
        }
    }

    public function testSendFailsSafelyWithoutAttemptingAnyNetworkCallWhenTheApiKeyIsNotConfigured(): void
    {
        $_ENV['RESEND_API_KEY'] = '';

        $result = (new MailerService())->send('cliente@parce.test', 'Asunto', '<p>Cuerpo</p>');

        $this->assertFalse($result);
    }

    public function testSendFailsSafelyWhenTheApiKeyEnvVarIsEntirelyUnset(): void
    {
        unset($_ENV['RESEND_API_KEY']);

        $result = (new MailerService())->send('cliente@parce.test', 'Asunto', '<p>Cuerpo</p>');

        $this->assertFalse($result);
    }
}
