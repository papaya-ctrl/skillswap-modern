<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class PostDetailTest extends TestCase
{
    use DatabaseMigrations;

    public function test_public_post_detail_returns_safe_fields(): void
    {
        $user = User::factory()->create([
            'name' => 'Maya Example',
            'username' => 'maya_demo',
            'email' => 'maya@example.com',
        ]);

        $category = Category::query()->create([
            'name' => 'IT & Programming',
            'slug' => 'it-programming',
        ]);

        $post = Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Need help understanding policies',
            'description' => 'Looking for a Laravel walkthrough.',
            'post_type' => 'request',
            'payment_type' => 'exchange',
            'image_path' => null,
        ]);

        $response = $this->getJson('/api/posts/'.$post->id);

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $post->id)
            ->assertJsonPath('data.author.username', 'maya_demo')
            ->assertJsonPath('data.permissions.can_edit', false)
            ->assertJsonPath('data.permissions.can_delete', false)
            ->assertJsonMissingPath('data.author.email');
    }
}
