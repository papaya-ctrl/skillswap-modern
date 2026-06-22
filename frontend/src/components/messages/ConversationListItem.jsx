import { Link } from 'react-router-dom'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function ConversationListItem({ conversation }) {
  const preview = conversation.last_message?.body ?? 'No messages yet. Start the conversation.'

  return (
    <Link className="conversation-list-item" to={`/inbox/${conversation.id}`}>
      <div className="conversation-list-item__header">
        <div className="stack stack--tiny">
          <p className="conversation-list-item__name">
            {conversation.other_participant.name}
          </p>
          <p className="conversation-list-item__handle">
            @{conversation.other_participant.username}
          </p>
        </div>

        <div className="conversation-list-item__meta">
          {conversation.unread_count ? (
            <span className="conversation-list-item__badge">
              {conversation.unread_count} unread
            </span>
          ) : null}
          <p className="conversation-list-item__time">
            {formatDate(conversation.last_activity_at)}
          </p>
        </div>
      </div>

      <div className="stack stack--tiny">
        <p className="conversation-list-item__post">
          Re: {conversation.post.title}
        </p>
        <p className="conversation-list-item__preview">{preview}</p>
      </div>
    </Link>
  )
}

export default ConversationListItem
