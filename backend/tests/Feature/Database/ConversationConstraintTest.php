<?php

namespace Tests\Feature\Database;

use App\Models\Category;
use App\Models\Conversation;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class ConversationConstraintTest extends TestCase
{
    use DatabaseMigrations;

    public function test_duplicate_conversation_pairs_for_the_same_post_are_rejected(): void
    {
        $userOne = User::factory()->create();
        $userTwo = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);
        $post = Post::query()->create([
            'user_id' => $userOne->id,
            'category_id' => $category->id,
            'title' => 'Constraint test post',
            'description' => 'Used to verify the normalized conversation uniqueness constraint.',
            'post_type' => 'request',
            'payment_type' => 'free',
            'image_path' => null,
        ]);

        [$normalizedUserOne, $normalizedUserTwo] = $userOne->id < $userTwo->id
            ? [$userOne->id, $userTwo->id]
            : [$userTwo->id, $userOne->id];

        Conversation::query()->create([
            'post_id' => $post->id,
            'user_one_id' => $normalizedUserOne,
            'user_two_id' => $normalizedUserTwo,
        ]);

        $this->expectException(QueryException::class);

        Conversation::query()->create([
            'post_id' => $post->id,
            'user_one_id' => $normalizedUserOne,
            'user_two_id' => $normalizedUserTwo,
        ]);
    }
}
