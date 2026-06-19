<?php

namespace Tests\Feature\Api;

use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CategoryIndexTest extends TestCase
{
    use DatabaseMigrations;

    public function test_categories_endpoint_returns_the_seeded_categories(): void
    {
        $this->seed(CategorySeeder::class);

        $response = $this->getJson('/api/categories');

        $response
            ->assertOk()
            ->assertJsonCount(6, 'data')
            ->assertJsonPath('data.0.slug', 'language-translation')
            ->assertJsonPath('data.5.slug', 'moving-music');
    }
}
