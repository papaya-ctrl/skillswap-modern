<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class PostMutationTest extends TestCase
{
    use DatabaseMigrations;

    public function test_unauthenticated_user_cannot_create_a_post(): void
    {
        $category = $this->createCategory();

        $response = $this->postJson('/api/posts', $this->validPayload($category->id));

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_a_post(): void
    {
        $user = User::factory()->create();
        $category = $this->createCategory();

        $response = $this
            ->actingAs($user)
            ->postJson('/api/posts', $this->validPayload($category->id));

        $response
            ->assertCreated()
            ->assertJsonPath('data.message', 'Post created successfully.')
            ->assertJsonPath('data.post.author.username', $user->username)
            ->assertJsonPath('data.post.permissions.can_edit', true);

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'title' => 'Need help preparing for a PHP interview',
        ]);
    }

    public function test_validation_errors_are_returned_clearly(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->postJson('/api/posts', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'title',
                'description',
                'post_type',
                'payment_type',
                'category_id',
            ]);
    }

    public function test_owner_can_edit_a_post(): void
    {
        [$user, $post] = $this->createOwnedPost();
        $replacementCategory = $this->createCategory('Moving & Music', 'moving-music');

        $response = $this
            ->actingAs($user)
            ->putJson('/api/posts/'.$post->id, [
                'title' => 'Updated title',
                'description' => 'Updated description',
                'post_type' => 'offer',
                'payment_type' => 'paid',
                'category_id' => $replacementCategory->id,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.message', 'Post updated successfully.')
            ->assertJsonPath('data.post.title', 'Updated title')
            ->assertJsonPath('data.post.category.slug', 'moving-music');

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Updated title',
            'category_id' => $replacementCategory->id,
        ]);
    }

    public function test_non_owner_cannot_edit_a_post(): void
    {
        [, $post] = $this->createOwnedPost();
        $otherUser = User::factory()->create();

        $response = $this
            ->actingAs($otherUser)
            ->putJson('/api/posts/'.$post->id, [
                'title' => 'Not allowed',
                'description' => 'Nope',
                'post_type' => 'offer',
                'payment_type' => 'free',
                'category_id' => $post->category_id,
            ]);

        $response->assertForbidden();
    }

    public function test_owner_can_delete_a_post(): void
    {
        [$user, $post] = $this->createOwnedPost();

        $response = $this
            ->actingAs($user)
            ->deleteJson('/api/posts/'.$post->id);

        $response
            ->assertOk()
            ->assertJsonPath('data.message', 'Post deleted successfully.');

        $this->assertDatabaseMissing('posts', [
            'id' => $post->id,
        ]);
    }

    public function test_non_owner_cannot_delete_a_post(): void
    {
        [, $post] = $this->createOwnedPost();
        $otherUser = User::factory()->create();

        $response = $this
            ->actingAs($otherUser)
            ->deleteJson('/api/posts/'.$post->id);

        $response->assertForbidden();
    }

    /**
     * @return array{0: User, 1: Post}
     */
    private function createOwnedPost(): array
    {
        $user = User::factory()->create();
        $category = $this->createCategory();

        $post = Post::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Original title',
            'description' => 'Original description',
            'post_type' => 'request',
            'payment_type' => 'exchange',
            'image_path' => null,
        ]);

        return [$user, $post];
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

    /**
     * @return array<string, int|string>
     */
    private function validPayload(int $categoryId): array
    {
        return [
            'title' => 'Need help preparing for a PHP interview',
            'description' => 'Looking for mock interview practice and feedback.',
            'post_type' => 'request',
            'payment_type' => 'exchange',
            'category_id' => $categoryId,
        ];
    }
}
