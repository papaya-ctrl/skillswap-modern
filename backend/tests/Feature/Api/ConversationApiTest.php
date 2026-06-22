<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class ConversationApiTest extends TestCase
{
    use DatabaseMigrations;

    public function test_authenticated_user_can_start_a_conversation_on_another_users_post(): void
    {
        [$post, $postOwner] = $this->createPost();
        $sender = User::factory()->create();

        $response = $this
            ->actingAs($sender)
            ->postJson('/api/conversations', [
                'post_id' => $post->id,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.conversation.post.id', $post->id)
            ->assertJsonPath('data.conversation.other_participant.id', $postOwner->id)
            ->assertJsonPath('data.conversation.unread_count', 0);

        [$userOneId, $userTwoId] = $this->normalizeParticipants($sender->id, $postOwner->id);

        $this->assertDatabaseHas('conversations', [
            'post_id' => $post->id,
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);
    }

    public function test_user_cannot_start_a_conversation_on_their_own_post(): void
    {
        [$post, $postOwner] = $this->createPost();

        $this
            ->actingAs($postOwner)
            ->postJson('/api/conversations', [
                'post_id' => $post->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['post_id']);
    }

    public function test_duplicate_conversation_creation_reuses_the_existing_conversation(): void
    {
        [$post, $postOwner] = $this->createPost();
        $sender = User::factory()->create();
        [$userOneId, $userTwoId] = $this->normalizeParticipants($sender->id, $postOwner->id);

        $conversation = Conversation::query()->create([
            'post_id' => $post->id,
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);

        $response = $this
            ->actingAs($sender)
            ->postJson('/api/conversations', [
                'post_id' => $post->id,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.conversation.id', $conversation->id);

        $this->assertSame(1, Conversation::query()->count());
    }

    public function test_unauthenticated_user_cannot_create_a_conversation(): void
    {
        [$post] = $this->createPost();

        $this->postJson('/api/conversations', [
            'post_id' => $post->id,
        ])->assertUnauthorized();
    }

    public function test_participant_can_list_their_conversations(): void
    {
        [$postOne, $ownerOne] = $this->createPost('Post one');
        [$postTwo, $ownerTwo] = $this->createPost('Post two');
        $participant = User::factory()->create();
        $outsider = User::factory()->create();

        $firstConversation = $this->createConversation($postOne, $participant, $ownerOne);
        $secondConversation = $this->createConversation($postTwo, $participant, $ownerTwo);
        $this->createConversation($postOne, $outsider, $ownerOne);

        Message::query()->create([
            'conversation_id' => $firstConversation->id,
            'sender_id' => $ownerOne->id,
            'recipient_id' => $participant->id,
            'body' => 'Unread for participant',
            'read_at' => null,
        ]);

        Message::query()->create([
            'conversation_id' => $secondConversation->id,
            'sender_id' => $participant->id,
            'recipient_id' => $ownerTwo->id,
            'body' => 'Newest message',
            'read_at' => null,
        ]);

        $response = $this
            ->actingAs($participant)
            ->getJson('/api/conversations');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $secondConversation->id)
            ->assertJsonPath('data.1.id', $firstConversation->id)
            ->assertJsonPath('data.1.unread_count', 1);
    }

    public function test_participant_can_view_a_conversation(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);

        $this
            ->actingAs($participant)
            ->getJson('/api/conversations/'.$conversation->id)
            ->assertOk()
            ->assertJsonPath('data.id', $conversation->id)
            ->assertJsonPath('data.other_participant.id', $postOwner->id);
    }

    public function test_non_participant_cannot_view_a_conversation(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $otherUser = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);

        $this
            ->actingAs($otherUser)
            ->getJson('/api/conversations/'.$conversation->id)
            ->assertForbidden();
    }

    public function test_participant_can_send_a_message(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);

        $response = $this
            ->actingAs($participant)
            ->postJson('/api/conversations/'.$conversation->id.'/messages', [
                'body' => '  Hello from the inbox.  ',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.message_record.body', 'Hello from the inbox.')
            ->assertJsonPath('data.message_record.sender.id', $participant->id)
            ->assertJsonPath('data.message_record.recipient.id', $postOwner->id)
            ->assertJsonPath('data.message_record.is_own_message', true);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $participant->id,
            'recipient_id' => $postOwner->id,
            'body' => 'Hello from the inbox.',
        ]);
    }

    public function test_non_participant_cannot_send_a_message(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $otherUser = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);

        $this
            ->actingAs($otherUser)
            ->postJson('/api/conversations/'.$conversation->id.'/messages', [
                'body' => 'This should fail.',
            ])
            ->assertForbidden();
    }

    public function test_message_sender_and_recipient_are_derived_server_side(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $spoofedUser = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);

        $this
            ->actingAs($participant)
            ->postJson('/api/conversations/'.$conversation->id.'/messages', [
                'body' => 'Ignore spoofed IDs.',
                'sender_id' => $spoofedUser->id,
                'recipient_id' => $spoofedUser->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.message_record.sender.id', $participant->id)
            ->assertJsonPath('data.message_record.recipient.id', $postOwner->id);
    }

    public function test_message_body_validation_errors_are_returned_clearly(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);

        $this
            ->actingAs($participant)
            ->postJson('/api/conversations/'.$conversation->id.'/messages', [
                'body' => '',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['body']);
    }

    public function test_mark_as_read_only_affects_messages_addressed_to_the_current_user(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);
        $otherConversation = $this->createConversation($post, User::factory()->create(), $postOwner);

        $messageForParticipant = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $postOwner->id,
            'recipient_id' => $participant->id,
            'body' => 'Unread for participant',
            'read_at' => null,
        ]);

        $participantsOwnMessage = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $participant->id,
            'recipient_id' => $postOwner->id,
            'body' => 'Should stay unread for the owner',
            'read_at' => null,
        ]);

        $messageInAnotherConversation = Message::query()->create([
            'conversation_id' => $otherConversation->id,
            'sender_id' => $postOwner->id,
            'recipient_id' => $otherConversation->user_one_id,
            'body' => 'Outside this conversation',
            'read_at' => null,
        ]);

        $this
            ->actingAs($participant)
            ->postJson('/api/conversations/'.$conversation->id.'/read')
            ->assertOk()
            ->assertJsonPath('data.marked_count', 1)
            ->assertJsonPath('data.unread_count', 0);

        $this->assertDatabaseMissing('messages', [
            'id' => $messageForParticipant->id,
            'read_at' => null,
        ]);
        $this->assertDatabaseHas('messages', [
            'id' => $participantsOwnMessage->id,
            'read_at' => null,
        ]);
        $this->assertDatabaseHas('messages', [
            'id' => $messageInAnotherConversation->id,
            'read_at' => null,
        ]);
    }

    public function test_unauthenticated_user_cannot_mark_a_conversation_as_read(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);

        $this->postJson('/api/conversations/'.$conversation->id.'/read')->assertUnauthorized();
    }

    public function test_non_participant_cannot_mark_a_conversation_as_read(): void
    {
        [$post, $postOwner] = $this->createPost();
        $participant = User::factory()->create();
        $otherUser = User::factory()->create();
        $conversation = $this->createConversation($post, $participant, $postOwner);

        $this
            ->actingAs($otherUser)
            ->postJson('/api/conversations/'.$conversation->id.'/read')
            ->assertForbidden();
    }

    /**
     * @return array{0: Post, 1: User}
     */
    private function createPost(string $title = 'Need Laravel help'): array
    {
        $owner = User::factory()->create();
        $category = Category::query()->firstOrCreate([
            'slug' => 'it-programming',
        ], [
            'name' => 'IT & Programming',
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

    private function createConversation(Post $post, User $firstUser, User $secondUser): Conversation
    {
        [$userOneId, $userTwoId] = $this->normalizeParticipants($firstUser->id, $secondUser->id);

        return Conversation::query()->create([
            'post_id' => $post->id,
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function normalizeParticipants(int $firstId, int $secondId): array
    {
        return $firstId < $secondId
            ? [$firstId, $secondId]
            : [$secondId, $firstId];
    }
}
