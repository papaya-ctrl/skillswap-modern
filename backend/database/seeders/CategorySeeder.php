<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * The verified legacy categories.
     *
     * @var list<string>
     */
    private const CATEGORIES = [
        'Language & Translation',
        'Tech & Digital',
        'Tutoring & Learning',
        'Health & Wellness',
        'IT & Programming',
        'Moving & Music',
    ];

    /**
     * Seed the application's categories.
     */
    public function run(): void
    {
        foreach (self::CATEGORIES as $name) {
            Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
