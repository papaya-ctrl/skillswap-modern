<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_authenticated_user_can_create_a_post_with_a_valid_image(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $category = $this->createCategory();

        $response = $this
            ->actingAs($user)
            ->post('/api/posts', [
                ...$this->validPayload($category->id),
                'image' => UploadedFile::fake()->image('original-name.jpg', 900, 600),
            ], [
                'Accept' => 'application/json',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.post.author.username', $user->username);

        $post = Post::query()->firstOrFail();
        $this->assertSafeImagePath($post->image_path);
        $this->assertStringNotContainsString('original-name', $post->image_path);
        Storage::disk('public')->assertExists($post->image_path);
        $this->assertStringContainsString('/storage/post-images/', $response->json('data.post.image_url'));
    }

    public function test_unauthenticated_user_cannot_upload_a_post_image(): void
    {
        Storage::fake('public');
        $category = $this->createCategory();

        $response = $this->post('/api/posts', [
            ...$this->validPayload($category->id),
            'image' => UploadedFile::fake()->image('skill.jpg'),
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertUnauthorized();
        Storage::disk('public')->assertMissing('post-images/skill.jpg');
        $this->assertDatabaseCount('posts', 0);
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

    public function test_invalid_post_image_type_is_rejected(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $category = $this->createCategory();

        $response = $this
            ->actingAs($user)
            ->post('/api/posts', [
                ...$this->validPayload($category->id),
                'image' => UploadedFile::fake()->create('not-an-image.php', 12, 'application/x-php'),
            ], [
                'Accept' => 'application/json',
            ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);

        $this->assertDatabaseCount('posts', 0);
        Storage::disk('public')->assertDirectoryEmpty('post-images');
    }

    public function test_oversized_post_image_is_rejected(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $category = $this->createCategory();

        $response = $this
            ->actingAs($user)
            ->post('/api/posts', [
                ...$this->validPayload($category->id),
                'image' => UploadedFile::fake()->image('too-large.jpg')->size(2049),
            ], [
                'Accept' => 'application/json',
            ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);

        $this->assertDatabaseCount('posts', 0);
        Storage::disk('public')->assertDirectoryEmpty('post-images');
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

    public function test_owner_can_replace_a_post_image(): void
    {
        Storage::fake('public');

        [$user, $post] = $this->createOwnedPost([
            'image_path' => 'post-images/old-image.jpg',
        ]);
        Storage::disk('public')->put('post-images/old-image.jpg', 'old image contents');

        $response = $this
            ->actingAs($user)
            ->post('/api/posts/'.$post->id, [
                '_method' => 'PUT',
                ...$this->validPayload($post->category_id),
                'image' => UploadedFile::fake()->image('replacement.png', 900, 600),
            ], [
                'Accept' => 'application/json',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.message', 'Post updated successfully.');

        $post->refresh();
        $this->assertSafeImagePath($post->image_path);
        $this->assertNotSame('post-images/old-image.jpg', $post->image_path);
        $this->assertStringNotContainsString('replacement', $post->image_path);
        Storage::disk('public')->assertExists($post->image_path);
        Storage::disk('public')->assertMissing('post-images/old-image.jpg');
    }

    public function test_owner_can_remove_a_post_image(): void
    {
        Storage::fake('public');

        [$user, $post] = $this->createOwnedPost([
            'image_path' => 'post-images/current-image.jpg',
        ]);
        Storage::disk('public')->put('post-images/current-image.jpg', 'current image contents');

        $response = $this
            ->actingAs($user)
            ->putJson('/api/posts/'.$post->id, [
                ...$this->validPayload($post->category_id),
                'remove_image' => true,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.post.image_url', null);

        $post->refresh();
        $this->assertNull($post->image_path);
        Storage::disk('public')->assertMissing('post-images/current-image.jpg');
    }

    public function test_replacement_request_cannot_also_remove_the_image(): void
    {
        Storage::fake('public');

        [$user, $post] = $this->createOwnedPost([
            'image_path' => 'post-images/current-image.jpg',
        ]);
        Storage::disk('public')->put('post-images/current-image.jpg', 'current image contents');

        $response = $this
            ->actingAs($user)
            ->post('/api/posts/'.$post->id, [
                '_method' => 'PUT',
                ...$this->validPayload($post->category_id),
                'remove_image' => true,
                'image' => UploadedFile::fake()->image('replacement.jpg'),
            ], [
                'Accept' => 'application/json',
            ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['remove_image']);

        $post->refresh();
        $this->assertSame('post-images/current-image.jpg', $post->image_path);
        Storage::disk('public')->assertExists('post-images/current-image.jpg');
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

    public function test_post_image_is_removed_after_deleting_post(): void
    {
        Storage::fake('public');

        [$user, $post] = $this->createOwnedPost([
            'image_path' => 'post-images/delete-me.jpg',
        ]);
        Storage::disk('public')->put('post-images/delete-me.jpg', 'delete me');

        $response = $this
            ->actingAs($user)
            ->deleteJson('/api/posts/'.$post->id);

        $response->assertOk();

        $this->assertDatabaseMissing('posts', [
            'id' => $post->id,
        ]);
        Storage::disk('public')->assertMissing('post-images/delete-me.jpg');
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

    public function test_non_owner_cannot_replace_or_remove_a_post_image(): void
    {
        Storage::fake('public');

        [, $post] = $this->createOwnedPost([
            'image_path' => 'post-images/protected.jpg',
        ]);
        Storage::disk('public')->put('post-images/protected.jpg', 'protected image');
        $otherUser = User::factory()->create();

        $replaceResponse = $this
            ->actingAs($otherUser)
            ->post('/api/posts/'.$post->id, [
                '_method' => 'PUT',
                ...$this->validPayload($post->category_id),
                'image' => UploadedFile::fake()->image('not-allowed.jpg'),
            ], [
                'Accept' => 'application/json',
            ]);

        $replaceResponse->assertForbidden();

        $removeResponse = $this
            ->actingAs($otherUser)
            ->putJson('/api/posts/'.$post->id, [
                ...$this->validPayload($post->category_id),
                'remove_image' => true,
            ]);

        $removeResponse->assertForbidden();

        $post->refresh();
        $this->assertSame('post-images/protected.jpg', $post->image_path);
        Storage::disk('public')->assertExists('post-images/protected.jpg');
    }

    /**
     * @return array{0: User, 1: Post}
     */
    private function createOwnedPost(array $overrides = []): array
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
            ...$overrides,
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

    private function assertSafeImagePath(?string $imagePath): void
    {
        $this->assertIsString($imagePath);
        $this->assertStringStartsWith('post-images/', $imagePath);
        $this->assertStringStartsNotWith('/', $imagePath);
        $this->assertStringNotContainsString('..', $imagePath);
    }
}
