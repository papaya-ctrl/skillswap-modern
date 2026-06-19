import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PostFeed from '../components/posts/PostFeed.jsx'
import Pagination from '../components/posts/Pagination.jsx'
import PostFilters from '../components/posts/PostFilters.jsx'
import { useAuth } from '../hooks/useAuth.js'
import * as categoryService from '../services/api/categoryService.js'
import * as postService from '../services/api/postService.js'

const initialFilters = {
  query: '',
  category_id: '',
  post_type: '',
}

function HomePage() {
  const { isAuthenticated } = useAuth()
  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [deletingPostId, setDeletingPostId] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadCategories() {
      try {
        const response = await categoryService.getCategories()

        if (!isActive) {
          return
        }

        setCategories(response)
      } catch (error) {
        if (isActive) {
          setPageError(error)
        }
      } finally {
        if (isActive) {
          setIsLoadingCategories(false)
        }
      }
    }

    loadCategories()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    async function loadPosts() {
      setIsLoadingPosts(true)
      setPageError(null)

      try {
        const response = await postService.getPosts({
          ...appliedFilters,
          page,
        })

        if (!isActive) {
          return
        }

        setPosts(response.data)
        setMeta(response.meta)
      } catch (error) {
        if (isActive) {
          setPageError(error)
        }
      } finally {
        if (isActive) {
          setIsLoadingPosts(false)
        }
      }
    }

    loadPosts()

    return () => {
      isActive = false
    }
  }, [appliedFilters, page])

  function handleFilterChange(event) {
    const { name, value } = event.target

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function handleFilterSubmit(event) {
    event.preventDefault()
    setAppliedFilters(draftFilters)
    setPage(1)
  }

  function handleResetFilters() {
    setDraftFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setPage(1)
  }

  async function reloadPosts(nextPage = page) {
    const response = await postService.getPosts({
      ...appliedFilters,
      page: nextPage,
    })

    setPosts(response.data)
    setMeta(response.meta)
  }

  async function handleDelete(post) {
    const confirmed = window.confirm(`Delete "${post.title}"? This cannot be undone.`)

    if (!confirmed) {
      return
    }

    setDeletingPostId(post.id)
    setPageError(null)

    try {
      await postService.deletePost(post.id)

      if (posts.length === 1 && (meta?.current_page ?? 1) > 1) {
        setPage((currentPage) => currentPage - 1)
      } else {
        await reloadPosts()
      }
    } catch (error) {
      setPageError(error)
    } finally {
      setDeletingPostId(null)
    }
  }

  if (isLoadingCategories && categories.length === 0) {
    return <LoadingState title="Loading categories" message="Preparing the SkillSwap feed." />
  }

  if (pageError && !posts.length && !isLoadingPosts) {
    return (
      <ErrorState
        title="Unable to load posts"
        message={pageError.message}
        actionLabel="Try again"
        onAction={() => reloadPosts(1)}
      />
    )
  }

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean)

  return (
    <section className="stack stack--page">
      <header className="hero-card">
        <div className="stack">
          <p className="hero-card__eyebrow">SkillSwap feed</p>
          <h1>Find skill exchanges, tutoring offers, and help requests.</h1>
          <p>
            Browse the public community feed, filter by category, and jump into the
            details before deciding whether to post your own skill swap.
          </p>
        </div>

        <div className="hero-card__actions">
          <Link className="button" to={isAuthenticated ? '/posts/new' : '/login'}>
            {isAuthenticated ? 'Create a post' : 'Login to post'}
          </Link>
          <Link className="button--ghost" to={isAuthenticated ? '/dashboard' : '/register'}>
            {isAuthenticated ? 'Open dashboard' : 'Create an account'}
          </Link>
        </div>
      </header>

      <PostFilters
        filters={draftFilters}
        categories={categories}
        onChange={handleFilterChange}
        onSubmit={handleFilterSubmit}
        onReset={handleResetFilters}
        isLoading={isLoadingPosts}
      />

      {pageError && posts.length ? (
        <p className="form__message">{pageError.message}</p>
      ) : null}

      {isLoadingPosts ? (
        <LoadingState title="Loading posts" message="Fetching the latest skill swaps." />
      ) : posts.length ? (
        <>
          <div className="feed-toolbar">
            <p className="feed-toolbar__summary">
              Showing {posts.length} of {meta?.total ?? posts.length} posts
            </p>
          </div>

          <PostFeed posts={posts} onDelete={handleDelete} deletingPostId={deletingPostId} />
          <Pagination
            currentPage={meta?.current_page ?? 1}
            lastPage={meta?.last_page ?? 1}
            onPageChange={setPage}
            isLoading={isLoadingPosts}
          />
        </>
      ) : (
        <EmptyState
          title="No posts match these filters"
          message="Try broadening the search, switching categories, or creating the first post in this topic."
          actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      )}
    </section>
  )
}

export default HomePage
