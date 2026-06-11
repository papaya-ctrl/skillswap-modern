<?php

namespace Tests\Feature\Database;

use App\Models\Category;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CategorySeederTest extends TestCase
{
    use DatabaseMigrations;

    public function test_category_seeder_creates_the_verified_legacy_categories(): void
    {
        $this->seed(CategorySeeder::class);

        $expectedCategories = [
            'Language & Translation' => 'language-translation',
            'Tech & Digital' => 'tech-digital',
            'Tutoring & Learning' => 'tutoring-learning',
            'Health & Wellness' => 'health-wellness',
            'IT & Programming' => 'it-programming',
            'Moving & Music' => 'moving-music',
        ];

        $this->assertSame(6, Category::query()->count());

        foreach ($expectedCategories as $name => $slug) {
            $this->assertDatabaseHas('categories', [
                'name' => $name,
                'slug' => $slug,
            ]);
        }
    }
}
