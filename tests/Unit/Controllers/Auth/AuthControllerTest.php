<?php

namespace Tests\Unit\Controllers\Auth;

use App\Controllers\Auth\AuthController;
use PHPUnit\Framework\TestCase;
use Tests\Unit\Support\MocksDatabase;
use Tests\Unit\Support\SimulatesHttp;

/**
 * Tests unitarios de AuthController — PDO mockeado, nunca MySQL real.
 *
 * BLOQUEO TÉCNICO REAL (reportado, sin resolver — ver informe de esta fase):
 * RequestValidator::parseJsonBody() lee su propio `file_get_contents('php://input')`
 * de forma independiente en cada llamada, ignorando el JSON ya parseado por
 * Request::__construct(). En el proceso CLI de PHPUnit, `php://input` está
 * siempre vacío, así que parseJsonBody() devuelve 400 ("body cannot be empty"/
 * "Invalid JSON format") ANTES de que el Controller llegue a su validación real,
 * su lógica de negocio, o la base de datos — para TODA acción POST/PUT de TODO
 * Controller del proyecto, no solo este. Por eso este archivo solo cubre las
 * acciones/ramas que no dependen de superar ese gate: logout(), me(), el 401
 * temprano de profile()/changePassword() (ocurre ANTES del parseJsonBody() de
 * esas dos acciones), y health() (GET, sin body). register()/login()/
 * changePassword()-éxito/forgotPassword()/resetPassword()/profile()-éxito
 * quedan sin cobertura de Controller hasta que se resuelva el bloqueo.
 */
class AuthControllerTest extends TestCase
{
    use MocksDatabase;
    use SimulatesHttp;

    private AuthController $controller;

    protected function setUp(): void
    {
        $this->mockPdo();
        $this->backupSuperglobals();
        $this->controller = new AuthController();
    }

    protected function tearDown(): void
    {
        $this->unmockPdo();
        $this->restoreSuperglobals();
    }

    private function activeUserRow(array $overrides = []): array
    {
        return array_merge([
            'id' => 7, 'email' => 'cliente@parce.local', 'password_hash' => '$argon2id$fake',
            'account_status' => 'active', 'first_name' => 'Test', 'last_name' => 'User',
            'phone' => null, 'last_login_at' => null, 'created_at' => '2026-01-01 00:00:00',
            'driver_license_number' => null, 'driver_license_expiration_date' => null,
            'driver_license_document_url' => null, 'driver_license_status' => 'not_set',
            'driver_license_uploaded_at' => null,
        ], $overrides);
    }

    // =========================================================================
    // logout()
    // =========================================================================

    public function testLogoutIsIdempotentWhenThereIsNoSessionCookie(): void
    {
        $this->mockPdo->expects($this->never())->method('prepare');

        $request = $this->makeRequest('POST', cookies: []);

        $response = $this->controller->logout($request);

        $this->assertSame(200, $response->getStatusCode());
    }

    public function testLogoutDestroysTheRealSessionAndClearsTheCookie(): void
    {
        $this->expectQueries([
            $this->stepWrite(1), // DELETE sessions
        ]);

        $request = $this->makeRequest('POST', cookies: ['parce_session' => 'session-abc']);

        $response = $this->controller->logout($request);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertStringContainsString('Max-Age=0', $this->responseHeader($response, 'Set-Cookie'));
    }

    // =========================================================================
    // me()
    // =========================================================================

    public function testMeReturns401WhenAuthMiddlewareDidNotAttachAUser(): void
    {
        $this->mockPdo->expects($this->never())->method('prepare');

        $request = $this->makeRequest('GET');

        $response = $this->controller->me($request);

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testMeReturnsTheFullProfileForTheAuthenticatedUser(): void
    {
        $this->expectQueries([
            $this->stepFetchOne($this->activeUserRow()),
            $this->stepFetchAll([['slug' => 'customer']]),
        ]);

        $request = $this->makeRequest('GET', attributes: ['user' => ['id' => 7]]);

        $response = $this->controller->me($request);
        $body = $this->responseBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('cliente@parce.local', $body['data']['email']);
    }

    // =========================================================================
    // profile() / changePassword() — solo el guard de autenticación temprano,
    // que corre ANTES de parseJsonBody() en ambas acciones.
    // =========================================================================

    public function testProfileReturns401WhenAuthMiddlewareDidNotAttachAUser(): void
    {
        $this->mockPdo->expects($this->never())->method('prepare');

        $request = $this->makeRequest('PUT');

        $response = $this->controller->profile($request);

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testChangePasswordReturns401WhenAuthMiddlewareDidNotAttachAUser(): void
    {
        $this->mockPdo->expects($this->never())->method('prepare');

        $request = $this->makeRequest('PUT');

        $response = $this->controller->changePassword($request);

        $this->assertSame(401, $response->getStatusCode());
    }

    // =========================================================================
    // health()
    // =========================================================================

    public function testHealthReturnsHealthyWhenTheDatabaseResponds(): void
    {
        $this->expectQueries([
            $this->stepFetchOne(['test' => 1]), // AuthService::checkDatabaseHealth()
        ]);

        $request = $this->makeRequest('GET');

        $response = $this->controller->health($request);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('healthy', $this->responseBody($response)['data']['status']);
    }
}
