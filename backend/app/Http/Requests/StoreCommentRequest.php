<?php

namespace App\Http\Requests;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'body' => is_string($this->input('body')) ? trim($this->input('body')) : $this->input('body'),
            'parent_id' => $this->input('parent_id') === '' ? null : $this->input('parent_id'),
        ]);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ];
    }

    protected function passedValidation(): void
    {
        $parentId = $this->validated('parent_id');

        if ($parentId === null) {
            return;
        }

        /** @var Post|null $post */
        $post = $this->route('post');
        $parentComment = Comment::query()->find($parentId);

        if ($post && $parentComment && $parentComment->post_id !== $post->id) {
            throw ValidationException::withMessages([
                'parent_id' => ['The selected parent comment does not belong to this post.'],
            ]);
        }
    }
}
