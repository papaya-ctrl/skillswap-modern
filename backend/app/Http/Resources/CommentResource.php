<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class CommentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        /** @var Collection<int, \App\Models\Comment> $replies */
        $replies = $this->relationLoaded('replies')
            ? $this->replies
            : collect();

        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'parent_id' => $this->parent_id,
            'body' => $this->body,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'author' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'username' => $this->user?->username,
            ],
            'permissions' => [
                'can_delete' => $user ? $user->can('delete', $this->resource) : false,
            ],
            'replies' => CommentResource::collection($replies),
        ];
    }
}
