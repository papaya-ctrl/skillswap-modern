import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PostForm from '../components/posts/PostForm.jsx'
import * as categoryService from '../services/api/categoryService.js'
import * as postService from '../services/api/postService.js'

function CreatePostPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadCategories() {
      try {
        const response = await categoryService.getCategories()

        if (isActive) {
          setCategories(response)
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

    loadCategories()

    return () => {
      isActive = false
    }
  }, [])

  async function handleSubmit(values) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await postService.createPost(values)

      navigate(`/posts/${response.post.id}`, { replace: true })
    } catch (requestError) {
      if (requestError.type === 'validation') {
        throw requestError
      }

      setError(requestError)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingState
        eyebrow="Create post"
        title="Preparing the post form"
        message="Loading categories."
      />
    )
  }

  if (error && categories.length === 0) {
    return (
      <ErrorState
        eyebrow={error.status === 0 ? 'Network issue' : 'Post form unavailable'}
        title="Unable to start a post"
        message={error.message}
        actionLabel="Back to feed"
        onAction={() => navigate('/', { replace: true })}
      />
    )
  }

  return (
    <section className="auth-layout">
      <div className="auth-card auth-card--wide">
        <p className="hero-card__eyebrow">Create post</p>
        <h1>Create a post</h1>
        <p>Share a skill you can offer or ask the community for focused help.</p>
        <PostForm
          categories={categories}
          onSubmit={handleSubmit}
          submitLabel="Create post"
          isSubmitting={isSubmitting}
          formError={error?.message ?? ''}
        />
      </div>
    </section>
  )
}

export default CreatePostPage
