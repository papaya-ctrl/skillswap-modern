import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import * as postService from '../services/api/postService.js'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function PostDetailPage() {
  const navigate = useNavigate()
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
            <p>{post.author.name}</p>
            <p>@{post.author.username}</p>
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
    </section>
  )
}

export default PostDetailPage
