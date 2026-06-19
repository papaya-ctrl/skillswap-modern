import { useState } from 'react'

function buildInitialValues(initialData) {
  if (!initialData) {
    return {
      title: '',
      description: '',
      category_id: '',
      post_type: 'offer',
      payment_type: 'free',
    }
  }

  return {
    title: initialData.title ?? '',
    description: initialData.description ?? '',
    category_id: String(initialData.category?.id ?? ''),
    post_type: initialData.post_type ?? 'offer',
    payment_type: initialData.payment_type ?? 'free',
  }
}

function PostForm({
  categories,
  initialData,
  onSubmit,
  submitLabel,
  isSubmitting,
  formError,
}) {
  const [values, setValues] = useState(() => buildInitialValues(initialData))
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})

    try {
      await onSubmit({
        ...values,
        category_id: Number(values.category_id),
      })
    } catch (error) {
      if (error.type === 'validation') {
        setErrors(error.errors)
        return
      }

      throw error
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {formError ? <p className="form__message">{formError}</p> : null}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={120}
          value={values.title}
          onChange={handleChange}
          placeholder="What skill are you offering or looking for?"
        />
        {errors.title ? <p className="field__error">{errors.title[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows="6"
          value={values.description}
          onChange={handleChange}
          placeholder="Share the context, skill level, and what a good exchange looks like."
        />
        {errors.description ? <p className="field__error">{errors.description[0]}</p> : null}
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="category_id">Category</label>
          <select
            id="category_id"
            name="category_id"
            value={values.category_id}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id ? <p className="field__error">{errors.category_id[0]}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="post_type">Post type</label>
          <select id="post_type" name="post_type" value={values.post_type} onChange={handleChange}>
            <option value="offer">Offering a skill</option>
            <option value="request">Requesting help</option>
          </select>
          {errors.post_type ? <p className="field__error">{errors.post_type[0]}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="payment_type">Exchange style</label>
          <select
            id="payment_type"
            name="payment_type"
            value={values.payment_type}
            onChange={handleChange}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
            <option value="exchange">Skill exchange</option>
          </select>
          {errors.payment_type ? <p className="field__error">{errors.payment_type[0]}</p> : null}
        </div>
      </div>

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

export default PostForm
