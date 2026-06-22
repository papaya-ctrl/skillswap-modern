import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PostForm from '../components/posts/PostForm.jsx'
import * as categoryService from '../services/api/categoryService.js'
import * as postService from '../services/api/postService.js'

function EditPostPage() {
  const navigate = useNavigate()
  const { postId } = useParams()
  const [categories, setCategories] = useState([])
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadPageData() {
      setIsLoading(true)
      setError(null)

      try {
        const [categoryResponse, postResponse] = await Promise.all([
          categoryService.getCategories(),
          postService.getPost(postId),
        ])

        if (!isActive) {
          return
        }

        if (!postResponse.permissions.can_edit) {
          setError({ message: 'You can only edit your own posts.', status: 403 })
          setPost(null)
          return
        }

        setCategories(categoryResponse)
        setPost(postResponse)
      } catch (requestError) {
        if (isActive) {
          setError(requestError.status === 403
            ? { ...requestError, message: 'You can only edit your own posts.' }
            : requestError)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadPageData()

    return () => {
      isActive = false
    }
  }, [postId])

  async function handleSubmit(values) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await postService.updatePost(postId, values)

      navigate(`/posts/${response.post.id}`, { replace: true })
    } catch (requestError) {
      if (requestError.type === 'validation') {
        throw requestError
      }

      setError(requestError.status === 403
        ? { ...requestError, message: 'You can only edit your own posts.' }
        : requestError)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingState
        eyebrow="Edit post"
        title="Loading post"
        message="Preparing the edit form."
      />
    )
  }

  if (error || !post) {
    return (
      <ErrorState
        eyebrow={error?.status === 403 ? 'Access denied' : 'Post unavailable'}
        title="Unable to edit this post"
        message={error?.message ?? 'The post could not be found.'}
        actionLabel="Back to feed"
        onAction={() => navigate('/', { replace: true })}
      />
    )
  }

  return (
    <section className="auth-layout">
      <div className="auth-card auth-card--wide">
        <p className="hero-card__eyebrow">Edit post</p>
        <h1>Edit your post</h1>
        <p>Update the details so other learners know exactly what you need or offer.</p>
        <PostForm
          categories={categories}
          initialData={post}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          isSubmitting={isSubmitting}
          formError={error?.message ?? ''}
        />
      </div>
    </section>
  )
}

export default EditPostPage
