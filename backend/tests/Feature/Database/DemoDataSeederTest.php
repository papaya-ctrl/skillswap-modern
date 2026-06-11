<?php

namespace Tests\Feature\Database;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class DemoDataSeederTest extends TestCase
{
    use DatabaseMigrations;

    public function test_demo_data_seeder_creates_expected_baseline_records(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('categories', 6);
        $this->assertGreaterThanOrEqual(4, \App\Models\User::query()->count());
        $this->assertGreaterThanOrEqual(10, \App\Models\Post::query()->count());
        $this->assertGreaterThanOrEqual(5, \App\Models\Comment::query()->count());
        $this->assertGreaterThanOrEqual(2, \App\Models\Conversation::query()->count());
        $this->assertGreaterThanOrEqual(4, \App\Models\Message::query()->count());

        $this->assertTrue(\App\Models\Comment::query()->whereNotNull('parent_id')->exists());
        $this->assertTrue(\App\Models\Post::query()->where('post_type', 'offer')->exists());
        $this->assertTrue(\App\Models\Post::query()->where('post_type', 'request')->exists());
    }
}
