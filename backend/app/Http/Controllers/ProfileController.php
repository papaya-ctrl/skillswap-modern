<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\ProfileResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function show(User $user, Request $request): JsonResponse
    {
        $filters = Validator::make($request->query(), [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:24'],
        ])->validate();

        $posts = $user->posts()
            ->with([
                'user:id,name,username',
                'category:id,name,slug',
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 9)
            ->withQueryString();

        return response()->json([
            'data' => (new ProfileResource($user))->resolve($request),
            'posts' => PostResource::collection($posts)->response()->getData(true),
        ]);
    }

    public function updateMe(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'data' => [
                'message' => 'Profile updated successfully.',
                'profile' => (new ProfileResource($user->fresh()))->resolve($request),
            ],
        ]);
    }
}
