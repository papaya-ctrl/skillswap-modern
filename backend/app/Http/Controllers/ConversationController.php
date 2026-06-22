<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConversationRequest;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->with([
                'post:id,title,post_type',
                'userOne:id,name,username',
                'userTwo:id,name,username',
                'latestMessage',
            ])
            ->withCount([
                'messages as unread_count' => fn ($query) => $query
                    ->where('recipient_id', $user->id)
                    ->whereNull('read_at'),
            ])
            ->withMax('messages as last_message_created_at', 'created_at')
            ->where(function ($query) use ($user): void {
                $query
                    ->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->orderByRaw('COALESCE(last_message_created_at, conversations.created_at) DESC')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => ConversationResource::collection($conversations)->resolve($request),
        ]);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $user = $request->user();
        $post = Post::query()->findOrFail($request->validated('post_id'));

        if ($post->user_id === $user->id) {
            throw ValidationException::withMessages([
                'post_id' => 'You cannot start a conversation on your own post.',
            ]);
        }

        [$userOneId, $userTwoId] = $this->normalizeParticipants($user->id, $post->user_id);

        $existingConversation = Conversation::query()
            ->where('post_id', $post->id)
            ->where('user_one_id', $userOneId)
            ->where('user_two_id', $userTwoId)
            ->first();

        if ($existingConversation) {
            $existingConversation = $this->loadConversation($existingConversation, $user);

            return response()->json([
                'data' => [
                    'message' => 'Conversation already exists.',
                    'conversation' => (new ConversationResource($existingConversation))->resolve($request),
                ],
            ]);
        }

        try {
            $conversation = Conversation::query()->create([
                'post_id' => $post->id,
                'user_one_id' => $userOneId,
                'user_two_id' => $userTwoId,
            ]);
            $conversation = $this->loadConversation($conversation, $user);

            return response()->json([
                'data' => [
                    'message' => 'Conversation created successfully.',
                    'conversation' => (new ConversationResource($conversation))->resolve($request),
                ],
            ], 201);
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() !== '23000') {
                throw $exception;
            }

            $conversation = Conversation::query()
                ->where('post_id', $post->id)
                ->where('user_one_id', $userOneId)
                ->where('user_two_id', $userTwoId)
                ->first();

            if (! $conversation) {
                throw $exception;
            }

            $conversation = $this->loadConversation($conversation, $user);

            return response()->json([
                'data' => [
                    'message' => 'Conversation already exists.',
                    'conversation' => (new ConversationResource($conversation))->resolve($request),
                ],
            ]);
        }
    }

    public function show(Request $request, Conversation $conversation): ConversationResource
    {
        Gate::authorize('view', $conversation);

        return new ConversationResource($this->loadConversation($conversation, $request->user()));
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        Gate::authorize('view', $conversation);

        $messages = Message::query()
            ->with([
                'sender:id,name,username',
                'recipient:id,name,username',
            ])
            ->where('conversation_id', $conversation->id)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => MessageResource::collection($messages)->resolve($request),
        ]);
    }

    public function storeMessage(
        StoreMessageRequest $request,
        Conversation $conversation
    ): JsonResponse {
        Gate::authorize('send', $conversation);

        $sender = $request->user();
        $recipientId = $conversation->user_one_id === $sender->id
            ? $conversation->user_two_id
            : $conversation->user_one_id;

        $message = $conversation->messages()->create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipientId,
            'body' => $request->validated('body'),
            'read_at' => null,
        ]);

        $message->load([
            'sender:id,name,username',
            'recipient:id,name,username',
        ]);

        return response()->json([
            'data' => [
                'message' => 'Message sent successfully.',
                'message_record' => (new MessageResource($message))->resolve($request),
            ],
        ], 201);
    }

    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        Gate::authorize('markRead', $conversation);

        $user = $request->user();

        $markedCount = Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        $unreadCount = Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'data' => [
                'marked_count' => $markedCount,
                'unread_count' => $unreadCount,
            ],
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

    private function loadConversation(Conversation $conversation, User $user): Conversation
    {
        $conversation->loadMissing([
            'post:id,title,post_type',
            'userOne:id,name,username',
            'userTwo:id,name,username',
            'latestMessage',
        ]);

        $conversation->loadCount([
            'messages as unread_count' => fn ($query) => $query
                ->where('recipient_id', $user->id)
                ->whereNull('read_at'),
        ]);

        return $conversation;
    }
}
