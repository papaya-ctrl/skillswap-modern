<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdatePostRequest extends StorePostRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        $rules['remove_image'] = [
            'sometimes',
            'boolean',
            Rule::prohibitedIf(fn (): bool => $this->hasFile('image')),
        ];

        return $rules;
    }
}
