import { Link } from 'react-router-dom'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function ProfileHeader({ profile, isOwner = false }) {
  return (
    <header className="hero-card profile-header">
      <div className="stack">
        <p className="hero-card__eyebrow">Public profile</p>
        <h1>{profile.name}</h1>
        <p className="profile-header__handle">@{profile.username}</p>
        <p>{profile.bio || 'This user has not added a bio yet.'}</p>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h2>Skills offered</h2>
          <p>{profile.skills_offered || 'No skills listed yet.'}</p>
        </div>

        <div className="panel">
          <h2>Skills wanted</h2>
          <p>{profile.skills_wanted || 'No requests listed yet.'}</p>
        </div>
      </div>

      <div className="hero-card__actions profile-header__actions">
        <p className="profile-header__meta">Joined {formatDate(profile.created_at)}</p>

        {isOwner ? (
          <Link className="button" to="/settings/profile">
            Edit profile
          </Link>
        ) : null}
      </div>
    </header>
  )
}

export default ProfileHeader
