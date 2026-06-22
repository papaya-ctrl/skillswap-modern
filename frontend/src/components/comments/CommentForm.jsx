import { useState } from 'react'

function CommentForm({
  onSubmit,
  submitLabel = 'Post comment',
  placeholder = 'Write a thoughtful reply.',
  isSubmitting = false,
  formError = '',
  onCancel,
}) {
  const [body, setBody] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      await onSubmit(body)
      setBody('')
    } catch (error) {
      if (error.type === 'validation') {
        setErrorMessage(error.errors.body?.[0] ?? error.message)
      }
    }
  }

  return (
    <form className="form comment-form" onSubmit={handleSubmit} noValidate>
      {formError ? <p className="form__message">{formError}</p> : null}
      {errorMessage ? <p className="field__error">{errorMessage}</p> : null}

      <div className="field">
        <textarea
          name="body"
          aria-label="Comment body"
          rows="3"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={placeholder}
        />
      </div>

      <div className="comment-form__actions">
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : submitLabel}
        </button>

        {onCancel ? (
          <button type="button" className="button--ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default CommentForm
