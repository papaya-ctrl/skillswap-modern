import PostCard from './PostCard.jsx'

function PostFeed({ posts, onDelete, deletingPostId }) {
  return (
    <section className="post-grid" aria-live="polite">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={onDelete}
          isDeleting={deletingPostId === post.id}
        />
      ))}
    </section>
  )
}

export default PostFeed
