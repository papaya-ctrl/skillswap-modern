import ConversationListItem from './ConversationListItem.jsx'

function ConversationList({ conversations }) {
  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <ConversationListItem key={conversation.id} conversation={conversation} />
      ))}
    </div>
  )
}

export default ConversationList
