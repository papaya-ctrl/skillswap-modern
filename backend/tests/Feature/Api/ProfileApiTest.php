<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use DatabaseMigrations;

    public function test_public_profile_returns_only_safe_public_fields(): void
    {
        $user = User::factory()->create([
            'name' => 'Alice Example',
            'username' => 'alice',
            'email' => 'alice@example.com',
            'bio' => 'Front-end student.',
            'skills_offered' => 'HTML, CSS',
            'skills_wanted' => 'Laravel',
        ]);

        $response = $this->getJson('/api/profiles/'.$user->id);

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.name', 'Alice Example')
            ->assertJsonPath('data.username', 'alice')
            ->assertJsonPath('data.bio', 'Front-end student.')
            ->assertJsonPath('data.skills_offered', 'HTML, CSS')
            ->assertJsonPath('data.skills_wanted', 'Laravel');

        $this->assertSame([
            'id',
            'name',
            'username',
            'bio',
            'skills_offered',
            'skills_wanted',
            'created_at',
        ], array_keys($response->json('data')));
    }

    public function test_public_profile_does_not_expose_email(): void
    {
        $user = User::factory()->create([
            'email' => 'private@example.com',
        ]);

        $response = $this->getJson('/api/profiles/'.$user->id);

        $response->assertOk();

        $this->assertArrayNotHasKey('email', $response->json('data'));
    }

    public function test_public_profile_returns_paginated_posts_for_that_user_only(): void
    {
        $category = $this->createCategory();
        $profileUser = User::factory()->create();
        $otherUser = User::factory()->create();

        foreach (range(1, 10) as $index) {
            Post::query()->create([
                'user_id' => $profileUser->id,
                'category_id' => $category->id,
                'title' => 'Profile Post '.$index,
                'description' => 'Description '.$index,
                'post_type' => 'offer',
                'payment_type' => 'free',
                'created_at' => now()->addMinutes($index),
                'updated_at' => now()->addMinutes($index),
            ]);
        }

        Post::query()->create([
            'user_id' => $otherUser->id,
            'category_id' => $category->id,
            'title' => 'Other user post',
            'description' => 'Should not be included.',
            'post_type' => 'request',
            'payment_type' => 'paid',
        ]);

        $response = $this->getJson('/api/profiles/'.$profileUser->id);

        $response
            ->assertOk()
            ->assertJsonCount(9, 'posts.data')
            ->assertJsonPath('posts.meta.current_page', 1)
            ->assertJsonPath('posts.meta.total', 10);

        $postAuthors = array_column($response->json('posts.data'), 'author');

        foreach ($postAuthors as $author) {
            $this->assertSame($profileUser->id, $author['id']);
        }
    }

    public function test_authenticated_user_can_update_their_own_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Before Name',
            'username' => 'before-user',
            'bio' => 'Before bio',
            'skills_offered' => 'Before offer',
            'skills_wanted' => 'Before want',
        ]);

        $response = $this
            ->actingAs($user)
            ->putJson('/api/me/profile', [
                'name' => 'After Name',
                'username' => 'after-user',
                'bio' => 'After bio',
                'skills_offered' => 'HTML, CSS',
                'skills_wanted' => 'React',
                'email' => 'ignored@example.com',
                'password' => 'not-allowed',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.message', 'Profile updated successfully.')
            ->assertJsonPath('data.profile.name', 'After Name')
            ->assertJsonPath('data.profile.username', 'after-user')
            ->assertJsonPath('data.profile.bio', 'After bio');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'After Name',
            'username' => 'after-user',
            'bio' => 'After bio',
            'skills_offered' => 'HTML, CSS',
            'skills_wanted' => 'React',
            'email' => $user->email,
        ]);
    }

    public function test_duplicate_username_is_rejected_while_current_username_is_allowed(): void
    {
        $existingUser = User::factory()->create([
            'username' => 'taken-user',
        ]);
        $currentUser = User::factory()->create([
            'username' => 'current-user',
        ]);

        $this
            ->actingAs($currentUser)
            ->putJson('/api/me/profile', [
                'name' => $currentUser->name,
                'username' => $currentUser->username,
                'bio' => $currentUser->bio,
                'skills_offered' => $currentUser->skills_offered,
                'skills_wanted' => $currentUser->skills_wanted,
            ])
            ->assertOk();

        $this
            ->actingAs($currentUser)
            ->putJson('/api/me/profile', [
                'name' => $currentUser->name,
                'username' => $existingUser->username,
                'bio' => $currentUser->bio,
                'skills_offered' => $currentUser->skills_offered,
                'skills_wanted' => $currentUser->skills_wanted,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }

    public function test_unauthenticated_user_cannot_update_a_profile(): void
    {
        $this->putJson('/api/me/profile', [
            'name' => 'Guest',
            'username' => 'guest-user',
        ])->assertUnauthorized();
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
