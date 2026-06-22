import PostFeed from '../posts/PostFeed.jsx'
import Pagination from '../posts/Pagination.jsx'

function ProfilePostList({
  posts,
  meta,
  onPageChange,
  isLoading = false,
}) {
  return (
    <section className="stack stack--page">
      <div className="feed-toolbar">
        <p className="feed-toolbar__summary">
          Showing {posts.length} of {meta?.total ?? posts.length} posts
        </p>
      </div>

      <PostFeed posts={posts} />
      <Pagination
        currentPage={meta?.current_page ?? 1}
        lastPage={meta?.last_page ?? 1}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />
    </section>
  )
}

export default ProfilePostList
