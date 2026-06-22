import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EditProfileForm from '../components/profiles/EditProfileForm.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import { useAuth } from '../hooks/useAuth.js'
import * as profileService from '../services/api/profileService.js'

function EditProfilePage() {
  const { refreshUser, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadProfile() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await profileService.getProfile(user.id)

        if (isActive) {
          setProfile(response.data)
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

    loadProfile()

    return () => {
      isActive = false
    }
  }, [user.id])

  async function handleSubmit(payload) {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage('')

    try {
      const response = await profileService.updateMyProfile(payload)
      setProfile(response.profile)
      setSuccessMessage('Profile updated successfully.')
      await refreshUser()
    } catch (requestError) {
      if (requestError.type === 'validation') {
        throw requestError
      }

      setError(requestError)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingState
        eyebrow="Profile settings"
        title="Loading profile editor"
        message="Preparing your current profile details."
      />
    )
  }

  if (error && !profile) {
    return (
      <ErrorState
        eyebrow={error.status === 0 ? 'Network issue' : 'Profile unavailable'}
        title="Unable to load your profile"
        message={error.message}
      />
    )
  }

  return (
    <section className="auth-layout">
      <div className="auth-card auth-card--wide">
        <div className="stack">
          <p className="hero-card__eyebrow">Profile settings</p>
          <h1>Edit your public profile</h1>
          <p>
            Update the details other SkillSwap members can see before they open your posts
            or start a conversation.
          </p>
        </div>

        <EditProfileForm
          key={JSON.stringify(profile)}
          initialData={profile}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          formError={error?.message ?? ''}
          successMessage={successMessage}
        />

        <div className="hero-card__actions profile-edit__actions">
          <Link className="button--ghost" to={`/profiles/${user.id}`}>
            View public profile
          </Link>
        </div>
      </div>
    </section>
  )
}

export default EditProfilePage
