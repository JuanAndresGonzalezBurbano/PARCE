<?php

namespace Tests\Unit\Infrastructure\Auth\DTO;

use App\Infrastructure\Auth\DTO\AuthResult;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class AuthResultTest extends TestCase
{
    public function testSuccessCreatesAResultWithUserIdAndSessionId(): void
    {
        $result = AuthResult::success(1, 'session123');

        $this->assertTrue($result->success);
        $this->assertSame(1, $result->userId);
        $this->assertSame('session123', $result->sessionId);
    }

    public function testFailureCreatesAResultWithAMessage(): void
    {
        $result = AuthResult::failure('Invalid credentials');

        $this->assertFalse($result->success);
        $this->assertSame('Invalid credentials', $result->message);
        $this->assertNull($result->userId);
        $this->assertNull($result->sessionId);
    }

    public function testConstructorRejectsSuccessTrueWithoutUserIdOrSessionId(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new AuthResult(true, null, null, null);
    }

    public function testConstructorRejectsFailureWithoutMessage(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new AuthResult(false, null, null, null);
    }
}
