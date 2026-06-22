function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function MessageBubble({ message }) {
  return (
    <article
      className={`message-bubble${message.is_own_message ? ' message-bubble--own' : ''}`}
    >
      <p className="message-bubble__author">
        {message.is_own_message ? 'You' : message.sender.name}
      </p>
      <p className="message-bubble__body">{message.body}</p>
      <p className="message-bubble__time">{formatDate(message.created_at)}</p>
    </article>
  )
}

export default MessageBubble
