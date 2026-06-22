<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'body' => $this->body,
            'read_at' => $this->read_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'sender' => [
                'id' => $this->sender?->id,
                'name' => $this->sender?->name,
                'username' => $this->sender?->username,
            ],
            'recipient' => [
                'id' => $this->recipient?->id,
                'name' => $this->recipient?->name,
                'username' => $this->recipient?->username,
            ],
            'is_own_message' => $user ? $this->sender_id === $user->id : false,
        ];
    }
}
