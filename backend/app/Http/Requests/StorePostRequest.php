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
     * @return array<string, array<int, string|\Illuminate\Validation\Rules\In>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string'],
            'post_type' => ['required', Rule::in(['offer', 'request'])],
            'payment_type' => ['required', Rule::in(['free', 'paid', 'exchange'])],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
        ];
    }
}
