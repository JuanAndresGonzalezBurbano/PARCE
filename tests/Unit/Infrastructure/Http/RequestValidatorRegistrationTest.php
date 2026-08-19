<?php

namespace Tests\Unit\Infrastructure\Http;

use App\Core\Request;
use App\Infrastructure\Http\RequestValidator;
use PHPUnit\Framework\TestCase;

/**
 * Cubre específicamente la restricción de rol en el registro público:
 * POST /api/auth/register SOLO puede crear usuarios con rol 'customer' (ver
 * docs/architecture/DECISIONS.md ADR-5). Cualquier otro valor de 'role' —
 * incluidos intentos de escalación a 'mechanic', 'administrator' o
 * 'super_admin' — debe rechazarse con un error de validación explícito
 * (400), nunca ignorarse en silencio.
 */
class RequestValidatorRegistrationTest extends TestCase
{
    private array $postBackup;

    protected function setUp(): void
    {
        $this->postBackup = $_POST;
    }

    protected function tearDown(): void
    {
        $_POST = $this->postBackup;
    }

    private function makeRequest(array $overrides = []): Request
    {
        $_POST = array_merge([
            'email'                 => 'nuevo@example.com',
            'password'              => 'ContrasenaSegura123',
            'password_confirmation' => 'ContrasenaSegura123',
            'first_name'            => 'Ana',
            'last_name'             => 'Gomez',
        ], $overrides);

        return new Request();
    }

    public function testRegistrationSucceedsWithoutRoleField(): void
    {
        $result = RequestValidator::validateRegistrationRequest($this->makeRequest());

        $this->assertTrue($result['valid']);
    }

    public function testRegistrationSucceedsWithExplicitCustomerRole(): void
    {
        $result = RequestValidator::validateRegistrationRequest($this->makeRequest(['role' => 'customer']));

        $this->assertTrue($result['valid']);
    }

    public function testRegistrationFailsWhenRoleIsMechanic(): void
    {
        $result = RequestValidator::validateRegistrationRequest($this->makeRequest(['role' => 'mechanic']));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('role', $result['errors']);
    }

    public function testRegistrationFailsWhenRoleIsAdministrator(): void
    {
        $result = RequestValidator::validateRegistrationRequest($this->makeRequest(['role' => 'administrator']));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('role', $result['errors']);
    }

    public function testRegistrationFailsWhenRoleIsSuperAdmin(): void
    {
        $result = RequestValidator::validateRegistrationRequest($this->makeRequest(['role' => 'super_admin']));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('role', $result['errors']);
    }

    public function testRegistrationFailsWhenRoleIsAnArbitraryManipulatedString(): void
    {
        // Cubre manipulación arbitraria del campo, no solo los slugs de rol reales
        $result = RequestValidator::validateRegistrationRequest($this->makeRequest(['role' => 'super_admin_hack']));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('role', $result['errors']);
    }
}
