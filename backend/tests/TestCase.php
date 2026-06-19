<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use PHPUnit\Framework\Assert;

abstract class TestCase extends BaseTestCase
{
    /**
     * Ensure tests only run against the approved MySQL testing database.
     */
    protected function setUp(): void
    {
        parent::setUp();

        Assert::assertSame('mysql', config('database.default'));
        Assert::assertSame('skillswap_modern_test', config('database.connections.mysql.database'));
        Assert::assertFileDoesNotExist(base_path('database/database.sqlite'));
    }
}
