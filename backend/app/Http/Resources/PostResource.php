<?php

namespace App\Http\Resources;

use App\Support\PostImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'post_type' => $this->post_type,
            'payment_type' => $this->payment_type,
            'image_url' => app(PostImageStorage::class)->url($this->image_path),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'author' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'username' => $this->user?->username,
            ],
            'category' => [
                'id' => $this->category?->id,
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ],
            'permissions' => [
                'can_edit' => $user ? $user->can('update', $this->resource) : false,
                'can_delete' => $user ? $user->can('delete', $this->resource) : false,
            ],
        ];
    }
}
