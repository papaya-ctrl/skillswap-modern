import { Link } from 'react-router-dom'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function PostCard({ post, onDelete, isDeleting = false }) {
  const excerpt = post.description.length > 180
    ? `${post.description.slice(0, 177)}...`
    : post.description

  return (
    <article className="post-card">
      <div className="post-card__meta">
        <span className={`badge badge--${post.post_type}`}>
          {post.post_type === 'offer' ? 'Offering a skill' : 'Requesting help'}
        </span>
        <span className="badge badge--muted">{post.payment_type}</span>
      </div>

      <div className="stack stack--tight">
        <div className="stack stack--tiny">
          <p className="post-card__category">{post.category.name}</p>
          <h2 className="post-card__title">
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </h2>
        </div>

        <p className="post-card__description">{excerpt}</p>

        <dl className="post-card__details">
          <div>
            <dt>Posted by</dt>
            <dd>
              <Link to={`/profiles/${post.author.id}`}>
                {post.author.name} (@{post.author.username})
              </Link>
            </dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDate(post.updated_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="post-card__actions">
        <Link className="button--ghost" to={`/posts/${post.id}`}>
          View details
        </Link>

        {post.permissions.can_edit ? (
          <Link className="button--ghost" to={`/posts/${post.id}/edit`}>
            Edit
          </Link>
        ) : null}

        {post.permissions.can_delete && onDelete ? (
          <button
            type="button"
            className="button--ghost button--danger"
            onClick={() => onDelete(post)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default PostCard
