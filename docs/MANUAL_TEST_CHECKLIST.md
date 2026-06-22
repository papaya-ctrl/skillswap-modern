# Milestone 7 Manual Test Checklist

Use this checklist after the backend and frontend are running locally.

## Accounts

- Demo password: `demo-password`
- Main test account: `maya.demo@example.test`
- Secondary test accounts: `leo.demo@example.test`, `aisha.demo@example.test`, `noah.demo@example.test`

## Guest Flow

- [ ] Open `http://localhost:5173` on desktop
- [ ] Confirm the home/feed page loads without console errors
- [ ] Confirm navbar links are visible and usable
- [ ] Confirm feed cards, filters, and pagination render correctly
- [ ] Open one post detail page as a guest
- [ ] Confirm comments section loads
- [ ] Confirm guests see a login prompt instead of the comment form
- [ ] Visit `/dashboard`, `/posts/new`, and `/inbox`
- [ ] Confirm protected routes redirect to `/login`

## Auth Flow

- [ ] Register a new user
- [ ] Confirm validation errors appear clearly for invalid input
- [ ] Log in with a valid account
- [ ] Confirm the authenticated navbar updates correctly
- [ ] Log out
- [ ] Confirm auth-only UI is cleared after logout

## Feed, Search, And Pagination

- [ ] Search by keyword
- [ ] Filter by category
- [ ] Filter by post type
- [ ] Reset filters
- [ ] Move between feed pages with pagination
- [ ] Confirm empty-state messaging is clear when filters produce no results

## Posts

- [ ] Create a post
- [ ] Trigger one `422` validation error on the create form
- [ ] Confirm a valid create redirects to the post detail page
- [ ] Edit your own post
- [ ] Delete your own post
- [ ] Confirm owner-only controls are not shown for other users
- [ ] Open another user’s edit URL directly
- [ ] Confirm the app shows a clear forbidden/owner-only result

## Profiles

- [ ] Open a public profile page
- [ ] Confirm public profile data and authored posts load
- [ ] Edit your own profile
- [ ] Confirm profile updates appear in the navbar, dashboard, and public profile

## Comments

- [ ] Add a top-level comment
- [ ] Add a reply comment
- [ ] Delete a comment you are allowed to remove
- [ ] Confirm unauthorized delete controls are hidden for unrelated users

## Inbox And Messaging

- [ ] Start a conversation from another user’s post
- [ ] Confirm the inbox list updates
- [ ] Open the conversation page
- [ ] Send a message
- [ ] Confirm unread/read behavior updates after opening the conversation
- [ ] Sign in as a different demo user
- [ ] Open a conversation that should be forbidden
- [ ] Confirm the app shows a clear `403`-style access message

## Responsive Review

Check at both desktop and mobile sizes:

- Desktop target: `1280x800`
- Mobile target: `390x844`

Routes to review:

- [ ] `/`
- [ ] `/login`
- [ ] `/register`
- [ ] `/dashboard`
- [ ] `/posts/:postId`
- [ ] `/posts/new`
- [ ] `/posts/:postId/edit`
- [ ] `/profiles/:userId`
- [ ] `/settings/profile`
- [ ] `/inbox`
- [ ] `/inbox/:conversationId`

Responsive checks:

- [ ] Navbar works on mobile and desktop
- [ ] Buttons do not overflow on small screens
- [ ] Cards stack cleanly on mobile
- [ ] Pagination remains usable on mobile
- [ ] Comments and message bubbles do not overflow horizontally

## Final Verification

- [ ] Run `php artisan test` in `backend/`
- [ ] Run `npm run lint` in `frontend/`
- [ ] Run `npm run build` in `frontend/`
- [ ] Run `git diff --check`
- [ ] Confirm `find backend -name '*.sqlite' -print` returns nothing
- [ ] Confirm dependency manifests were not changed unexpectedly
- [ ] Confirm no ignored or private files are staged
- [ ] Confirm `legacy-reference/` remains unchanged
