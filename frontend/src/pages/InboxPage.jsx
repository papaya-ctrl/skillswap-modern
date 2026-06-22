import { useEffect, useState } from 'react'
import ConversationList from '../components/messages/ConversationList.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import * as conversationService from '../services/api/conversationService.js'

function InboxPage() {
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadConversations() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await conversationService.getConversations()

        if (isActive) {
          setConversations(response)
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

    loadConversations()

    return () => {
      isActive = false
    }
  }, [])

  async function handleRetry() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await conversationService.getConversations()
      setConversations(response)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !conversations.length) {
    return <LoadingState title="Loading inbox" message="Gathering your latest SkillSwap conversations." />
  }

  if (error && !conversations.length) {
    return (
      <ErrorState
        title="Unable to load inbox"
        message={error.message}
        actionLabel="Try again"
        onAction={handleRetry}
      />
    )
  }

  return (
    <section className="stack stack--page">
      <header className="hero-card">
        <div className="stack stack--tiny">
          <p className="hero-card__eyebrow">Inbox</p>
          <h1>Your private conversations</h1>
          <p className="page-copy">
            Follow up on post replies, ask for more details, and keep your messages organized in one place.
          </p>
        </div>
      </header>

      {error ? <p className="form__message">{error.message}</p> : null}

      {conversations.length ? (
        <ConversationList conversations={conversations} />
      ) : (
        <EmptyState
          title="No conversations yet"
          message="Start from a post detail page when you want to contact another SkillSwap member."
        />
      )}
    </section>
  )
}

export default InboxPage
