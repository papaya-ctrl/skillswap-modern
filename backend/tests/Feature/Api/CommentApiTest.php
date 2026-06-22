<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CommentApiTest extends TestCase
{
    use DatabaseMigrations;

    public function test_public_post_comments_endpoint_returns_a_threaded_structure(): void
    {
        [$post, $author] = $this->createPost();
        $replyAuthor = User::factory()->create();

        $parent = Comment::query()->create([
            'post_id' => $post->id,
            'user_id' => $author->id,
            'parent_id' => null,
            'body' => 'Parent comment',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Comment::query()->create([
            'post_id' => $post->id,
            'user_id' => $replyAuthor->id,
            'parent_id' => $parent->id,
            'body' => 'Reply comment',
            'created_at' => now()->addMinute(),
            'updated_at' => now()->addMinute(),
        ]);

        $response = $this->getJson('/api/posts/'.$post->id.'/comments');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'Parent comment')
            ->assertJsonPath('data.0.replies.0.body', 'Reply comment');
    }

    public function test_authenticated_user_can_create_a_top_level_comment(): void
    {
        [$post] = $this->createPost();
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->postJson('/api/posts/'.$post->id.'/comments', [
                'body' => '  Happy to help with this.  ',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.message', 'Comment created successfully.')
            ->assertJsonPath('data.comment.body', 'Happy to help with this.')
            ->assertJsonPath('data.comment.author.id', $user->id)
            ->assertJsonPath('data.comment.parent_id', null);

        $this->assertDatabaseHas('comments', [
            'post_id' => $post->id,
            'user_id' => $user->id,
            'body' => 'Happy to help with this.',
        ]);
    }

    public function test_authenticated_user_can_create_a_reply(): void
    {
        [$post] = $this->createPost();
        $parentAuthor = User::factory()->create();
        $replyAuthor = User::factory()->create();

        $parentComment = Comment::query()->create([
            'post_id' => $post->id,
            'user_id' => $parentAuthor->id,
            'parent_id' => null,
            'body' => 'Parent comment',
        ]);

        $response = $this
            ->actingAs($replyAuthor)
            ->postJson('/api/posts/'.$post->id.'/comments', [
                'body' => 'This is a reply.',
                'parent_id' => $parentComment->id,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.comment.parent_id', $parentComment->id)
            ->assertJsonPath('data.comment.body', 'This is a reply.');
    }

    public function test_parent_id_must_belong_to_the_same_post(): void
    {
        [$post] = $this->createPost();
        [$otherPost] = $this->createPost('Another title');
        $user = User::factory()->create();

        $otherPostComment = Comment::query()->create([
            'post_id' => $otherPost->id,
            'user_id' => $user->id,
            'parent_id' => null,
            'body' => 'Other post parent',
        ]);

        $this
            ->actingAs($user)
            ->postJson('/api/posts/'.$post->id.'/comments', [
                'body' => 'Invalid reply target.',
                'parent_id' => $otherPostComment->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_unauthenticated_user_cannot_create_a_comment(): void
    {
        [$post] = $this->createPost();

        $this->postJson('/api/posts/'.$post->id.'/comments', [
            'body' => 'Guest comment',
        ])->assertUnauthorized();
    }

    public function test_comment_author_can_delete_their_own_comment(): void
    {
        [$post] = $this->createPost();
        $user = User::factory()->create();

        $comment = Comment::query()->create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'parent_id' => null,
            'body' => 'Delete me',
        ]);

        $this
            ->actingAs($user)
            ->deleteJson('/api/comments/'.$comment->id)
            ->assertOk()
            ->assertJsonPath('data.message', 'Comment deleted successfully.');

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id,
        ]);
    }

    public function test_post_owner_can_delete_comment_on_their_post(): void
    {
        [$post, $postOwner] = $this->createPost();
        $commentAuthor = User::factory()->create();

        $comment = Comment::query()->create([
            'post_id' => $post->id,
            'user_id' => $commentAuthor->id,
            'parent_id' => null,
            'body' => 'Owner can moderate this.',
        ]);

        $this
            ->actingAs($postOwner)
            ->deleteJson('/api/comments/'.$comment->id)
            ->assertOk();

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id,
        ]);
    }

    public function test_non_owner_non_author_cannot_delete_comment(): void
    {
        [$post] = $this->createPost();
        $commentAuthor = User::factory()->create();
        $otherUser = User::factory()->create();

        $comment = Comment::query()->create([
            'post_id' => $post->id,
            'user_id' => $commentAuthor->id,
            'parent_id' => null,
            'body' => 'Protected comment',
        ]);

        $this
            ->actingAs($otherUser)
            ->deleteJson('/api/comments/'.$comment->id)
            ->assertForbidden();
    }

    /**
     * @return array{0: Post, 1: User}
     */
    private function createPost(string $title = 'Need Laravel help'): array
    {
        $owner = User::factory()->create();
        $category = Category::query()->firstOrCreate([
            'slug' => 'tech-digital',
        ], [
            'name' => 'Tech & Digital',
        ]);

        $post = Post::query()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => $title,
            'description' => 'Looking for support.',
            'post_type' => 'request',
            'payment_type' => 'exchange',
            'image_path' => null,
        ]);

        return [$post, $owner];
    }
}
