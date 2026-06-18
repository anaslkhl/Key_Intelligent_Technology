<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'client';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'robot_id' => ['required', 'uuid', 'exists:robots,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string', 'max:5000'],
            'pros' => ['nullable', 'string', 'max:2000'],
            'cons' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'robot_id.required' => 'Please choose the robot you want to review.',
            'robot_id.exists' => 'The selected robot does not exist.',
            'rating.required' => 'Please provide a rating from 1 to 5.',
            'rating.min' => 'The rating must be at least 1 star.',
            'rating.max' => 'The rating may not be greater than 5 stars.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Validation failed.',
            'errors' => $validator->errors(),
            'status' => 422,
        ], 422));
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Only clients can submit reviews.',
            'errors' => (object) [],
            'status' => 403,
        ], 403));
    }
}
