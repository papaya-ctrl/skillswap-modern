import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CommentForm from '../components/comments/CommentForm.jsx'
import CommentThread from '../components/comments/CommentThread.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import { useAuth } from '../hooks/useAuth.js'
import * as commentService from '../services/api/commentService.js'
import * as postService from '../services/api/postService.js'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function PostDetailPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [commentError, setCommentError] = useState(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [activeReplyParentId, setActiveReplyParentId] = useState(null)
  const [activeDeleteCommentId, setActiveDeleteCommentId] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadPost() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await postService.getPost(postId)

        if (isActive) {
          setPost(response)
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadPost()

    return () => {
      isActive = false
    }
  }, [postId])

  useEffect(() => {
    let isActive = true

    async function loadComments() {
      setIsLoadingComments(true)
      setCommentError(null)
      setComments([])

      try {
        const response = await commentService.getComments(postId)

        if (isActive) {
          setComments(response)
        }
      } catch (requestError) {
        if (isActive) {
          setCommentError(requestError)
        }
      } finally {
        if (isActive) {
          setIsLoadingComments(false)
        }
      }
    }

    loadComments()

    return () => {
      isActive = false
    }
  }, [postId])

  async function handleDelete() {
    if (!post) {
      return
    }

    const confirmed = window.confirm(`Delete "${post.title}"? This cannot be undone.`)

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await postService.deletePost(post.id)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError)
    } finally {
      setIsDeleting(false)
    }
  }

  async function reloadComments() {
    const response = await commentService.getComments(postId)
    setComments(response)
  }

  async function handleRetryComments() {
    setIsLoadingComments(true)
    setCommentError(null)

    try {
      await reloadComments()
    } catch (requestError) {
      setCommentError(requestError)
    } finally {
      setIsLoadingComments(false)
    }
  }

  async function handleCreateComment(body) {
    setIsSubmittingComment(true)
    setCommentError(null)

    try {
      await commentService.createComment(postId, { body })
      await reloadComments()
    } catch (requestError) {
      if (requestError.type === 'validation') {
        throw requestError
      }

      setCommentError(requestError)
      throw requestError
    } finally {
      setIsSubmittingComment(false)
    }
  }

  async function handleReply(parentId, body) {
    setActiveReplyParentId(parentId)
    setCommentError(null)

    try {
      await commentService.createComment(postId, {
        body,
        parent_id: parentId,
      })
      await reloadComments()
    } catch (requestError) {
      if (requestError.type === 'validation') {
        throw requestError
      }

      setCommentError(requestError)
      throw requestError
    } finally {
      setActiveReplyParentId(null)
    }
  }

  async function handleDeleteComment(comment) {
    const confirmed = window.confirm('Delete this comment? Replies will remain visible.')

    if (!confirmed) {
      return
    }

    setActiveDeleteCommentId(comment.id)
    setCommentError(null)

    try {
      await commentService.deleteComment(comment.id)
      await reloadComments()
    } catch (requestError) {
      setCommentError(requestError)
    } finally {
      setActiveDeleteCommentId(null)
    }
  }

  if (isLoading) {
    return <LoadingState title="Loading post" message="Pulling the latest post details." />
  }

  if (error || !post) {
    return (
      <ErrorState
        title="Unable to load this post"
        message={error?.message ?? 'The post could not be found.'}
        actionLabel="Back to feed"
        onAction={() => navigate('/', { replace: true })}
      />
    )
  }

  return (
    <section className="stack stack--page">
      <article className="hero-card">
        <div className="stack stack--tiny">
          <div className="post-card__meta">
            <span className={`badge badge--${post.post_type}`}>
              {post.post_type === 'offer' ? 'Offering a skill' : 'Requesting help'}
            </span>
            <span className="badge badge--muted">{post.payment_type}</span>
            <span className="badge badge--muted">{post.category.name}</span>
          </div>

          <h1>{post.title}</h1>
          <p className="page-copy">{post.description}</p>
        </div>

        <dl className="detail-grid">
          <div className="panel">
            <h2>Author</h2>
            <p>
              <Link to={`/profiles/${post.author.id}`}>{post.author.name}</Link>
            </p>
            <p>
              <Link to={`/profiles/${post.author.id}`}>@{post.author.username}</Link>
            </p>
          </div>
          <div className="panel">
            <h2>Updated</h2>
            <p>{formatDate(post.updated_at)}</p>
            <p>Posted {formatDate(post.created_at)}</p>
          </div>
        </dl>

        <div className="hero-card__actions">
          <Link className="button--ghost" to="/">
            Back to feed
          </Link>

          {post.permissions.can_edit ? (
            <Link className="button" to={`/posts/${post.id}/edit`}>
              Edit post
            </Link>
          ) : null}

          {post.permissions.can_delete ? (
            <button
              type="button"
              className="button--ghost button--danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete post'}
            </button>
          ) : null}
        </div>
      </article>

      <section className="panel comments-panel">
        <div className="stack">
          <div className="stack stack--tiny">
            <p className="hero-card__eyebrow">Discussion</p>
            <h2 className="comments-panel__title">Comments</h2>
            <p className="page-copy">
              Ask a follow-up question, offer help, or add context for this post.
            </p>
          </div>

          {isAuthenticated ? (
            <CommentForm
              onSubmit={handleCreateComment}
              isSubmitting={isSubmittingComment}
              formError={commentError?.message ?? ''}
              submitLabel="Post comment"
              placeholder="Share a helpful reply or question."
            />
          ) : (
            <div className="comment-login-prompt">
              <p>Log in to join the conversation.</p>
              <Link className="button" to="/login">
                Login to comment
              </Link>
            </div>
          )}

          {isLoadingComments ? (
            <LoadingState title="Loading comments" message="Fetching the latest discussion for this post." />
          ) : commentError && !comments.length ? (
            <ErrorState
              title="Unable to load comments"
              message={commentError.message}
              actionLabel="Try again"
              onAction={handleRetryComments}
            />
          ) : comments.length ? (
            <CommentThread
              comments={comments}
              onDelete={handleDeleteComment}
              onReply={handleReply}
              activeReplyParentId={activeReplyParentId}
              activeDeleteCommentId={activeDeleteCommentId}
            />
          ) : (
            <EmptyState
              title="No comments yet"
              message="Be the first person to start the discussion on this post."
            />
          )}
        </div>
      </section>
    </section>
  )
}

export default PostDetailPage
