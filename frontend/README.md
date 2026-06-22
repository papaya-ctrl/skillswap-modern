# SkillSwap Frontend

This React + Vite frontend now covers Milestone 5 public profiles, profile editing, and threaded comments on top of the existing Sanctum auth shell and Milestone 4 post flow.

## Local environment

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Run the frontend

```bash
cd frontend
npm run dev -- --host localhost --port 5173
```

## Frontend checks

```bash
cd frontend
npm run lint
npm run build
```

## Route overview

- Public: `/`, `/login`, `/register`, `/posts/:postId`, `/profiles/:userId`
- Protected: `/dashboard`, `/settings/profile`, `/posts/new`, `/posts/:postId/edit`

## Milestone 5 behavior

- Home page is now the public feed with keyword, category, and post-type filters.
- Feed uses normal pagination and links every card to a public post-detail page.
- Authenticated users can create posts, edit their own posts, and delete their own posts.
- Owner-only actions are hidden unless the API returns `permissions.can_edit` or `permissions.can_delete`.
- Create, edit, and delete all stay inside the SPA and redirect after success.
- Public profile pages show safe public user fields plus paginated posts from that member only.
- Authenticated users can edit their own profile from `/settings/profile`, then immediately refresh navbar and dashboard auth state.
- Post detail pages load comments separately from the post, support threaded replies, and show a login prompt instead of a comment form for guests.
- Comment delete actions are only shown when the API says the current user is allowed to moderate that comment.

## HTTP behavior

- Uses native `fetch` only
- Sends `credentials: 'include'` on API requests
- Fetches `/sanctum/csrf-cookie` before register, login, logout, create, update, and delete requests
- Reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN`
- Handles `401`, `419`, `422`, and owner-only `403` responses with focused UI states
