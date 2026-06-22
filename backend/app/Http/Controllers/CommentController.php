<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    public function index(Post $post): JsonResponse
    {
        $comments = Comment::query()
            ->with([
                'user:id,name,username',
                'post:id,user_id',
            ])
            ->where('post_id', $post->id)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        $threadedComments = $this->buildThread($comments);

        return response()->json([
            'data' => CommentResource::collection($threadedComments)->resolve(request()),
        ]);
    }

    public function store(StoreCommentRequest $request, Post $post): JsonResponse
    {
        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            ...$request->validated(),
        ]);

        $comment->load([
            'user:id,name,username',
            'post:id,user_id',
        ]);
        $comment->setRelation('replies', new EloquentCollection());

        return response()->json([
            'data' => [
                'message' => 'Comment created successfully.',
                'comment' => (new CommentResource($comment))->resolve($request),
            ],
        ], 201);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        Gate::authorize('delete', $comment);

        $comment->delete();

        return response()->json([
            'data' => [
                'message' => 'Comment deleted successfully.',
            ],
        ]);
    }

    /**
     * @param  EloquentCollection<int, Comment>  $comments
     * @return EloquentCollection<int, Comment>
     */
    private function buildThread(EloquentCollection $comments): EloquentCollection
    {
        /** @var Collection<int, EloquentCollection<int, Comment>> $commentsByParent */
        $commentsByParent = $comments->groupBy('parent_id');

        return $this->attachReplies($commentsByParent, null);
    }

    /**
     * @param  Collection<int, EloquentCollection<int, Comment>>  $commentsByParent
     * @return EloquentCollection<int, Comment>
     */
    private function attachReplies(Collection $commentsByParent, ?int $parentId): EloquentCollection
    {
        $comments = $commentsByParent->get($parentId, new EloquentCollection());

        $comments->each(function (Comment $comment) use ($commentsByParent): void {
            $comment->setRelation('replies', $this->attachReplies($commentsByParent, $comment->id));
        });

        return $comments;
    }
}
