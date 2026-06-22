import { useState } from 'react'

function buildInitialValues(initialData) {
  return {
    name: initialData?.name ?? '',
    username: initialData?.username ?? '',
    bio: initialData?.bio ?? '',
    skills_offered: initialData?.skills_offered ?? '',
    skills_wanted: initialData?.skills_wanted ?? '',
  }
}

function EditProfileForm({
  initialData,
  onSubmit,
  isSubmitting,
  formError,
  successMessage,
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
      await onSubmit(values)
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
      {successMessage ? <p className="form__success">{successMessage}</p> : null}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={255}
          value={values.name}
          onChange={handleChange}
          placeholder="How should people know you?"
        />
        {errors.name ? <p className="field__error">{errors.name[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          maxLength={30}
          value={values.username}
          onChange={handleChange}
          placeholder="Choose a public handle"
        />
        {errors.username ? <p className="field__error">{errors.username[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows="4"
          value={values.bio}
          onChange={handleChange}
          placeholder="Share a quick intro and the kind of skill swaps you enjoy."
        />
        {errors.bio ? <p className="field__error">{errors.bio[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="skills_offered">Skills offered</label>
        <textarea
          id="skills_offered"
          name="skills_offered"
          rows="3"
          value={values.skills_offered}
          onChange={handleChange}
          placeholder="What can you help others learn?"
        />
        {errors.skills_offered ? <p className="field__error">{errors.skills_offered[0]}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="skills_wanted">Skills wanted</label>
        <textarea
          id="skills_wanted"
          name="skills_wanted"
          rows="3"
          value={values.skills_wanted}
          onChange={handleChange}
          placeholder="What are you hoping to learn next?"
        />
        {errors.skills_wanted ? <p className="field__error">{errors.skills_wanted[0]}</p> : null}
      </div>

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}

export default EditProfileForm
