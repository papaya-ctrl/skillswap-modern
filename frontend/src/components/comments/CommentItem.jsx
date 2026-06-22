import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import CommentForm from './CommentForm.jsx'
import CommentThread from './CommentThread.jsx'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function CommentItem({
  comment,
  onDelete,
  onReply,
  activeReplyParentId,
  activeDeleteCommentId,
}) {
  const { isAuthenticated } = useAuth()
  const [isReplying, setIsReplying] = useState(false)

  async function handleReply(body) {
    await onReply(comment.id, body)
    setIsReplying(false)
  }

  return (
    <article className="comment-card">
      <div className="comment-card__header">
        <div className="stack stack--tiny">
          <p className="comment-card__author">
            <Link to={`/profiles/${comment.author.id}`}>
              {comment.author.name}
            </Link>
          </p>
          <p className="comment-card__handle">@{comment.author.username}</p>
        </div>

        <p className="comment-card__time">{formatDate(comment.created_at)}</p>
      </div>

      <p className="comment-card__body">{comment.body}</p>

      <div className="comment-card__actions">
        {isAuthenticated ? (
          <button
            type="button"
            className="button--ghost"
            onClick={() => setIsReplying((currentValue) => !currentValue)}
          >
            {isReplying ? 'Hide reply' : 'Reply'}
          </button>
        ) : null}

        {comment.permissions.can_delete ? (
          <button
            type="button"
            className="button--ghost button--danger"
            onClick={() => onDelete(comment)}
            disabled={activeDeleteCommentId === comment.id}
          >
            {activeDeleteCommentId === comment.id ? 'Deleting...' : 'Delete'}
          </button>
        ) : null}
      </div>

      {isReplying ? (
        <CommentForm
          onSubmit={handleReply}
          submitLabel="Post reply"
          placeholder="Write a reply to this comment."
          isSubmitting={activeReplyParentId === comment.id}
          onCancel={() => setIsReplying(false)}
        />
      ) : null}

      {comment.replies.length ? (
        <CommentThread
          comments={comment.replies}
          onDelete={onDelete}
          onReply={onReply}
          activeReplyParentId={activeReplyParentId}
          activeDeleteCommentId={activeDeleteCommentId}
          isNested
        />
      ) : null}
    </article>
  )
}

export default CommentItem
