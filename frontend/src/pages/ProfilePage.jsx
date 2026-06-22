import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import ProfileHeader from '../components/profiles/ProfileHeader.jsx'
import ProfilePostList from '../components/profiles/ProfilePostList.jsx'
import { useAuth } from '../hooks/useAuth.js'
import * as profileService from '../services/api/profileService.js'

function ProfilePageContent({ userId }) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadProfile() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await profileService.getProfile(userId, { page })

        if (!isActive) {
          return
        }

        setProfile(response.data)
        setPosts(response.posts.data)
        setMeta(response.posts.meta)
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
  }, [page, userId])

  if (isLoading) {
    return <LoadingState title="Loading profile" message="Pulling this member's public profile." />
  }

  if (error || !profile) {
    return (
      <ErrorState
        title="Unable to load this profile"
        message={error?.message ?? 'The requested profile could not be found.'}
        actionLabel="Back to feed"
        onAction={() => navigate('/', { replace: true })}
      />
    )
  }

  const isOwner = isAuthenticated && user?.id === profile.id

  return (
    <section className="stack stack--page">
      <ProfileHeader profile={profile} isOwner={isOwner} />

      {posts.length ? (
        <ProfilePostList
          posts={posts}
          meta={meta}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      ) : (
        <EmptyState
          title="No public posts yet"
          message="This user has not published any SkillSwap posts yet."
        />
      )}
    </section>
  )
}

function ProfilePage() {
  const { userId } = useParams()

  return <ProfilePageContent key={userId} userId={userId} />
}

export default ProfilePage
