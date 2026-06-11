<?php

namespace Tests\Feature\Database;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Post;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class RelationshipIntegrityTest extends TestCase
{
    use DatabaseMigrations;

    public function test_key_milestone_two_relationships_return_expected_records(): void
    {
        $this->seed(DatabaseSeeder::class);

        $user = User::query()->where('username', 'maya_demo')->firstOrFail();
        $post = Post::query()->where('title', 'Need help understanding Laravel service providers')->firstOrFail();
        $comment = Comment::query()->whereNotNull('parent_id')->firstOrFail();
        $conversation = Conversation::query()->firstOrFail();
        $message = Message::query()->firstOrFail();
        $category = Category::query()->where('name', 'IT & Programming')->firstOrFail();

        $this->assertInstanceOf(Collection::class, $user->posts);
        $this->assertContainsOnlyInstancesOf(Post::class, $user->posts);
        $this->assertInstanceOf(Collection::class, $user->comments);
        $this->assertContainsOnlyInstancesOf(Comment::class, $user->comments);
        $this->assertInstanceOf(Collection::class, $user->messagesSent);
        $this->assertContainsOnlyInstancesOf(Message::class, $user->messagesSent);

        $this->assertInstanceOf(User::class, $post->user);
        $this->assertInstanceOf(Category::class, $post->category);
        $this->assertInstanceOf(Collection::class, $post->comments);
        $this->assertContainsOnlyInstancesOf(Comment::class, $post->comments);
        $this->assertInstanceOf(Collection::class, $post->conversations);
        $this->assertContainsOnlyInstancesOf(Conversation::class, $post->conversations);

        $this->assertInstanceOf(Post::class, $comment->post);
        $this->assertInstanceOf(User::class, $comment->user);
        $this->assertInstanceOf(Comment::class, $comment->parent);
        $this->assertContainsOnlyInstancesOf(Comment::class, $comment->parent->replies);

        $this->assertInstanceOf(Post::class, $conversation->post);
        $this->assertInstanceOf(User::class, $conversation->userOne);
        $this->assertInstanceOf(User::class, $conversation->userTwo);
        $this->assertContainsOnlyInstancesOf(Message::class, $conversation->messages);

        $this->assertInstanceOf(Conversation::class, $message->conversation);
        $this->assertInstanceOf(User::class, $message->sender);
        $this->assertInstanceOf(User::class, $message->recipient);

        $this->assertContainsOnlyInstancesOf(Post::class, $category->posts);
    }
}
