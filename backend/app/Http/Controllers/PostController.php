<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = Validator::make($request->query(), [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:24'],
            'query' => ['nullable', 'string', 'max:120'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'post_type' => ['nullable', Rule::in(['offer', 'request'])],
        ])->validate();

        $posts = Post::query()
            ->with([
                'user:id,name,username',
                'category:id,name,slug',
            ])
            ->when($filters['query'] ?? null, function ($query, string $searchTerm) {
                $query->where(function ($searchQuery) use ($searchTerm): void {
                    $searchQuery
                        ->where('title', 'like', '%'.$searchTerm.'%')
                        ->orWhere('description', 'like', '%'.$searchTerm.'%');
                });
            })
            ->when($filters['category_id'] ?? null, fn ($query, int $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['post_type'] ?? null, fn ($query, string $postType) => $query->where('post_type', $postType))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 9)
            ->withQueryString();

        return PostResource::collection($posts);
    }

    public function show(Post $post): PostResource
    {
        $post->loadMissing([
            'user:id,name,username',
            'category:id,name,slug',
        ]);

        return new PostResource($post);
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $post = $request->user()->posts()->create([
            ...$request->validated(),
            'image_path' => null,
        ]);

        $post->load([
            'user:id,name,username',
            'category:id,name,slug',
        ]);

        return response()->json([
            'data' => [
                'message' => 'Post created successfully.',
                'post' => new PostResource($post),
            ],
        ], 201);
    }

    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        Gate::authorize('update', $post);

        $post->update($request->validated());
        $post->load([
            'user:id,name,username',
            'category:id,name,slug',
        ]);

        return response()->json([
            'data' => [
                'message' => 'Post updated successfully.',
                'post' => new PostResource($post),
            ],
        ]);
    }

    public function destroy(Post $post): JsonResponse
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return response()->json([
            'data' => [
                'message' => 'Post deleted successfully.',
            ],
        ]);
    }
}
