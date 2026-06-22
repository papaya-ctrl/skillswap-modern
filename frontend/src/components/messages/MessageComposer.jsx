import { useState } from 'react'

function MessageComposer({ onSubmit, isSubmitting }) {
  const [body, setBody] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      await onSubmit(body)
      setBody('')
    } catch (error) {
      setErrorMessage(error.errors?.body?.[0] ?? error.message)
    }
  }

  return (
    <form className="form message-composer" onSubmit={handleSubmit} noValidate>
      {errorMessage ? <p className="form__message">{errorMessage}</p> : null}

      <div className="field">
        <label htmlFor="message-body">Message</label>
        <textarea
          id="message-body"
          name="body"
          rows="4"
          placeholder="Write a helpful message to continue the skill swap."
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </div>

      <div className="message-composer__actions">
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>
      </div>
    </form>
  )
}

export default MessageComposer
