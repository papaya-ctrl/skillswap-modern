<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string'],
            'post_type' => ['required', Rule::in(['offer', 'request'])],
            'payment_type' => ['required', Rule::in(['free', 'paid', 'exchange'])],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'image' => [
                'nullable',
                'file',
                'image',
                'mimetypes:image/jpeg,image/png,image/webp',
                'mimes:jpg,jpeg,png,webp',
                'extensions:jpg,jpeg,png,webp',
                'max:2048',
            ],
            'remove_image' => ['prohibited'],
        ];
    }
}
