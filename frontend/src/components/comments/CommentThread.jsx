import CommentItem from './CommentItem.jsx'

function CommentThread({
  comments,
  onDelete,
  onReply,
  activeReplyParentId,
  activeDeleteCommentId,
  isNested = false,
}) {
  return (
    <div className={`comment-thread${isNested ? ' comment-thread--nested' : ''}`}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onDelete={onDelete}
          onReply={onReply}
          activeReplyParentId={activeReplyParentId}
          activeDeleteCommentId={activeDeleteCommentId}
        />
      ))}
    </div>
  )
}

export default CommentThread
