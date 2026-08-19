<?php

namespace Tests\Unit\Infrastructure\MechanicApplication;

use App\Core\Request;
use App\Infrastructure\MechanicApplication\MechanicApplicationValidator;
use PHPUnit\Framework\TestCase;

class MechanicApplicationValidatorTest extends TestCase
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

    private function makeRequest(array $data): Request
    {
        $_POST = $data;
        return new Request();
    }

    public function testCreateRequestPassesWithValidJustification(): void
    {
        $result = MechanicApplicationValidator::validateCreateRequest($this->makeRequest([
            'justification' => 'Tengo 5 años de experiencia como mecánico automotriz certificado.',
        ]));

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
    }

    public function testCreateRequestFailsWhenJustificationIsMissing(): void
    {
        $result = MechanicApplicationValidator::validateCreateRequest($this->makeRequest([]));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('justification', $result['errors']);
    }

    public function testCreateRequestFailsWhenJustificationIsOnlyWhitespace(): void
    {
        $result = MechanicApplicationValidator::validateCreateRequest($this->makeRequest([
            'justification' => '                    ',
        ]));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('justification', $result['errors']);
    }

    public function testCreateRequestFailsWhenJustificationIsTooShort(): void
    {
        $result = MechanicApplicationValidator::validateCreateRequest($this->makeRequest([
            'justification' => 'Muy corto',
        ]));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('justification', $result['errors']);
    }

    public function testCreateRequestFailsWhenJustificationExceedsMaxLength(): void
    {
        $result = MechanicApplicationValidator::validateCreateRequest($this->makeRequest([
            'justification' => str_repeat('a', 2001),
        ]));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('justification', $result['errors']);
    }

    public function testRejectRequestPassesWithAValidReason(): void
    {
        $result = MechanicApplicationValidator::validateRejectRequest($this->makeRequest([
            'rejection_reason' => 'La licencia de conducción está vencida.',
        ]));

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
    }

    public function testRejectRequestFailsWhenReasonIsMissing(): void
    {
        $result = MechanicApplicationValidator::validateRejectRequest($this->makeRequest([]));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('rejection_reason', $result['errors']);
    }

    public function testRejectRequestFailsWhenReasonIsOnlyWhitespace(): void
    {
        $result = MechanicApplicationValidator::validateRejectRequest($this->makeRequest([
            'rejection_reason' => '   ',
        ]));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('rejection_reason', $result['errors']);
    }

    public function testRejectRequestFailsWhenReasonExceedsMaxLength(): void
    {
        $result = MechanicApplicationValidator::validateRejectRequest($this->makeRequest([
            'rejection_reason' => str_repeat('a', 1001),
        ]));

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('rejection_reason', $result['errors']);
    }

    public function testGetValidStatusesReturnsTheFourExpectedStates(): void
    {
        $this->assertSame(
            ['pending', 'approved', 'rejected', 'cancelled'],
            MechanicApplicationValidator::getValidStatuses()
        );
    }
}
