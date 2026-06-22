import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import MessageComposer from '../components/messages/MessageComposer.jsx'
import MessageList from '../components/messages/MessageList.jsx'
import * as conversationService from '../services/api/conversationService.js'
import * as messageService from '../services/api/messageService.js'

async function fetchConversationData(conversationId) {
  return Promise.all([
    conversationService.getConversation(conversationId),
    messageService.getMessages(conversationId),
  ])
}

function ConversationPage() {
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [pageError, setPageError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  useEffect(() => {
    let isActive = true

    async function bootstrap() {
      setIsLoading(true)
      setLoadError(null)
      setPageError(null)

      try {
        const [conversationResponse, messagesResponse] = await fetchConversationData(conversationId)

        if (!isActive) {
          return
        }

        setConversation(conversationResponse)
        setMessages(messagesResponse)
      } catch (requestError) {
        if (isActive) {
          setLoadError(requestError)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      isActive = false
    }
  }, [conversationId])

  useEffect(() => {
    let isActive = true

    async function syncReadState() {
      if (!conversation || !conversation.unread_count || isMarkingRead) {
        return
      }

      setIsMarkingRead(true)

      try {
        await conversationService.markConversationRead(conversation.id)

        if (!isActive) {
          return
        }

        const [conversationResponse, messagesResponse] = await fetchConversationData(conversationId)

        if (!isActive) {
          return
        }

        setConversation(conversationResponse)
        setMessages(messagesResponse)
      } catch (requestError) {
        if (isActive) {
          setPageError(requestError)
        }
      } finally {
        if (isActive) {
          setIsMarkingRead(false)
        }
      }
    }

    syncReadState()

    return () => {
      isActive = false
    }
  }, [conversation, conversationId, isMarkingRead])

  async function handleRetry() {
    setIsLoading(true)
    setLoadError(null)
    setPageError(null)

    try {
      const [conversationResponse, messagesResponse] = await fetchConversationData(conversationId)
      setConversation(conversationResponse)
      setMessages(messagesResponse)
    } catch (requestError) {
      setLoadError(requestError)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendMessage(body) {
    setIsSubmitting(true)
    setPageError(null)

    try {
      await messageService.createMessage(conversationId, { body })
      const [conversationResponse, messagesResponse] = await fetchConversationData(conversationId)
      setConversation(conversationResponse)
      setMessages(messagesResponse)
    } catch (requestError) {
      if (requestError.type === 'validation') {
        throw requestError
      }

      setPageError(requestError)
      throw requestError
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingState
        eyebrow="Conversation"
        title="Loading conversation"
        message="Opening your private inbox thread."
      />
    )
  }

  if (loadError || !conversation) {
    const forbiddenMessage = loadError?.type === 'forbidden'
      ? 'You do not have access to this conversation.'
      : loadError?.message ?? 'This conversation could not be loaded.'

    return (
      <ErrorState
        eyebrow={loadError?.type === 'forbidden' ? 'Access denied' : 'Conversation unavailable'}
        title="Conversation unavailable"
        message={forbiddenMessage}
        actionLabel={loadError?.type === 'forbidden' ? 'Back to inbox' : 'Try again'}
        onAction={loadError?.type === 'forbidden'
          ? () => navigate('/inbox', { replace: true })
          : handleRetry}
      />
    )
  }

  return (
    <section className="stack stack--page">
      <article className="hero-card">
        <div className="stack stack--tiny">
          <p className="hero-card__eyebrow">Conversation</p>
          <h1>{conversation.other_participant.name}</h1>
          <p className="page-copy">
            Continue your discussion about “{conversation.post.title}”.
          </p>
        </div>

        <div className="conversation-page__meta">
          <span className={`badge badge--${conversation.post.post_type}`}>
            {conversation.post.post_type === 'offer' ? 'Offering a skill' : 'Requesting help'}
          </span>
          <p className="conversation-page__handle">
            @{conversation.other_participant.username}
          </p>
        </div>

        <div className="hero-card__actions">
          <Link className="button--ghost" to="/inbox">
            Back to inbox
          </Link>
          <Link className="button--ghost" to={`/posts/${conversation.post.id}`}>
            View post
          </Link>
        </div>
      </article>

      {pageError ? (
        <ErrorState
          compact
          eyebrow={pageError.type === 'forbidden' ? 'Access denied' : 'Conversation issue'}
          title="Could not update this conversation"
          message={pageError.message}
          actionLabel="Try again"
          onAction={handleRetry}
        />
      ) : null}

      <section className="panel stack">
        {messages.length ? (
          <MessageList messages={messages} />
        ) : (
          <EmptyState
            compact
            eyebrow="Conversation"
            title="No messages yet"
            message="Start the conversation with a clear introduction and a helpful next step."
          />
        )}

        <MessageComposer onSubmit={handleSendMessage} isSubmitting={isSubmitting || isMarkingRead} />
      </section>
    </section>
  )
}

export default ConversationPage
