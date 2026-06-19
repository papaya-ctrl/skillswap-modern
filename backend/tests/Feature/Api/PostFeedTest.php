<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class PostFeedTest extends TestCase
{
    use DatabaseMigrations;

    public function test_post_feed_returns_paginated_results(): void
    {
        $category = $this->createCategory();
        $user = User::factory()->create();

        foreach (range(1, 10) as $index) {
            Post::query()->create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'title' => 'Post '.$index,
                'description' => 'Description '.$index,
                'post_type' => 'offer',
                'payment_type' => 'free',
                'created_at' => now()->addMinutes($index),
                'updated_at' => now()->addMinutes($index),
            ]);
        }

        $response = $this->getJson('/api/posts');

        $response
            ->assertOk()
            ->assertJsonCount(9, 'data')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 9)
            ->assertJsonPath('meta.total', 10);

        $this->assertNotNull($response->json('links.first'));
        $this->assertNotNull($response->json('links.next'));
    }

    public function test_newest_posts_appear_first_with_id_tiebreaker(): void
    {
        $category = $this->createCategory();
        $user = User::factory()->create();
        $timestamp = now();

        $olderPost = Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Older post',
            'description' => 'Created first.',
            'post_type' => 'offer',
            'payment_type' => 'free',
            'created_at' => $timestamp->copy()->subMinute(),
            'updated_at' => $timestamp->copy()->subMinute(),
        ]);

        $firstNewest = Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Newest but lower id',
            'description' => 'Same timestamp.',
            'post_type' => 'request',
            'payment_type' => 'paid',
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $secondNewest = Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Newest and higher id',
            'description' => 'Same timestamp, later id.',
            'post_type' => 'offer',
            'payment_type' => 'exchange',
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $response = $this->getJson('/api/posts');

        $this->assertSame([
            $secondNewest->id,
            $firstNewest->id,
            $olderPost->id,
        ], array_column($response->json('data'), 'id'));
    }

    public function test_keyword_search_matches_title_and_description(): void
    {
        $category = $this->createCategory();
        $user = User::factory()->create();

        Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Need Laravel debugging help',
            'description' => 'Mentor requested.',
            'post_type' => 'request',
            'payment_type' => 'exchange',
        ]);

        Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Spanish conversation swap',
            'description' => 'Happy to help with Laravel architecture questions.',
            'post_type' => 'offer',
            'payment_type' => 'free',
        ]);

        Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Guitar basics',
            'description' => 'Acoustic intro session.',
            'post_type' => 'offer',
            'payment_type' => 'paid',
        ]);

        $response = $this->getJson('/api/posts?query=Laravel');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_category_filter_restricts_results(): void
    {
        $codingCategory = $this->createCategory('IT & Programming', 'it-programming');
        $musicCategory = $this->createCategory('Moving & Music', 'moving-music');
        $user = User::factory()->create();

        Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $codingCategory->id,
            'title' => 'Coding help',
            'description' => 'PHP and Laravel.',
            'post_type' => 'offer',
            'payment_type' => 'free',
        ]);

        Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $musicCategory->id,
            'title' => 'Piano lesson',
            'description' => 'Scales and chords.',
            'post_type' => 'offer',
            'payment_type' => 'paid',
        ]);

        $response = $this->getJson('/api/posts?category_id='.$musicCategory->id);

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category.id', $musicCategory->id);
    }

    public function test_post_type_filter_restricts_results(): void
    {
        $category = $this->createCategory();
        $user = User::factory()->create();

        Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Offer tutoring',
            'description' => 'Frontend basics.',
            'post_type' => 'offer',
            'payment_type' => 'free',
        ]);

        Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Need SQL help',
            'description' => 'Normalization guidance.',
            'post_type' => 'request',
            'payment_type' => 'exchange',
        ]);

        $response = $this->getJson('/api/posts?post_type=request');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.post_type', 'request');
    }

    private function createCategory(
        string $name = 'Tech & Digital',
        string $slug = 'tech-digital',
    ): Category {
        return Category::query()->create([
            'name' => $name,
            'slug' => $slug,
        ]);
    }
}
