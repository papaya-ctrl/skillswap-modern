import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import * as conversationService from '../../services/api/conversationService.js'

function StartConversationButton({ postId, isOwner = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (isOwner) {
    return null
  }

  async function handleStartConversation() {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const conversation = await conversationService.createConversation({
        post_id: postId,
      })

      navigate(`/inbox/${conversation.id}`)
    } catch (error) {
      setErrorMessage(error.errors?.post_id?.[0] ?? error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="start-conversation">
      {isAuthenticated ? (
        <button
          type="button"
          className="button"
          onClick={handleStartConversation}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Opening conversation...' : 'Message owner'}
        </button>
      ) : (
        <Link className="button" to="/login" state={{ from: location }}>
          Message owner
        </Link>
      )}

      {errorMessage ? <p className="form__message">{errorMessage}</p> : null}
    </div>
  )
}

export default StartConversationButton
