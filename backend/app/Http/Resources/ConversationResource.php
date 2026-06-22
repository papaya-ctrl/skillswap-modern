<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var User|null $user */
        $user = $request->user();
        $otherParticipant = $this->resolveOtherParticipant($user);
        $lastMessage = $this->relationLoaded('latestMessage') ? $this->latestMessage : null;
        $lastActivityAt = $lastMessage?->created_at ?? $this->created_at;

        return [
            'id' => $this->id,
            'post' => [
                'id' => $this->post?->id,
                'title' => $this->post?->title,
                'post_type' => $this->post?->post_type,
            ],
            'other_participant' => [
                'id' => $otherParticipant?->id,
                'name' => $otherParticipant?->name,
                'username' => $otherParticipant?->username,
            ],
            'last_message' => $lastMessage ? [
                'id' => $lastMessage->id,
                'body' => $lastMessage->body,
                'sender_id' => $lastMessage->sender_id,
                'recipient_id' => $lastMessage->recipient_id,
                'created_at' => $lastMessage->created_at?->toISOString(),
                'read_at' => $lastMessage->read_at?->toISOString(),
            ] : null,
            'unread_count' => (int) ($this->unread_count ?? 0),
            'last_activity_at' => $lastActivityAt?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function resolveOtherParticipant(?User $user): ?User
    {
        if (! $user) {
            return $this->userOne ?? $this->userTwo;
        }

        if ($user->id === $this->user_one_id) {
            return $this->userTwo;
        }

        return $this->userOne;
    }
}
