<?php

namespace Tests\Feature\Database;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SchemaMigrationTest extends TestCase
{
    use DatabaseMigrations;

    public function test_migrations_create_required_tables(): void
    {
        $this->assertTrue(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('categories'));
        $this->assertTrue(Schema::hasTable('posts'));
        $this->assertTrue(Schema::hasTable('comments'));
        $this->assertTrue(Schema::hasTable('conversations'));
        $this->assertTrue(Schema::hasTable('messages'));
        $this->assertTrue(Schema::hasTable('personal_access_tokens'));
    }

    public function test_users_table_contains_milestone_two_profile_columns(): void
    {
        $this->assertTrue(Schema::hasColumns('users', [
            'name',
            'username',
            'email',
            'password',
            'bio',
            'skills_offered',
            'skills_wanted',
        ]));
    }
}
