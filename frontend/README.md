# SkillSwap Frontend

This React + Vite frontend now covers Milestone 6 inbox and messaging on top of the existing Sanctum auth shell, public feed, profiles, posts, and threaded comments.

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
- Protected: `/dashboard`, `/settings/profile`, `/posts/new`, `/posts/:postId/edit`, `/inbox`, `/inbox/:conversationId`

## Milestone 6 behavior

- Home page is now the public feed with keyword, category, and post-type filters.
- Feed uses normal pagination and links every card to a public post-detail page.
- Authenticated users can create posts, edit their own posts, and delete their own posts.
- Owner-only actions are hidden unless the API returns `permissions.can_edit` or `permissions.can_delete`.
- Create, edit, and delete all stay inside the SPA and redirect after success.
- Public profile pages show safe public user fields plus paginated posts from that member only.
- Authenticated users can edit their own profile from `/settings/profile`, then immediately refresh navbar and dashboard auth state.
- Post detail pages load comments separately from the post, support threaded replies, and show a login prompt instead of a comment form for guests.
- Comment delete actions are only shown when the API says the current user is allowed to moderate that comment.
- Post detail pages now include a `Message owner` action for non-owners. Guests are redirected to login first, then returned to the same post page.
- `/inbox` lists the authenticated user’s conversations with last-message previews, unread counts, and related post context.
- `/inbox/:conversationId` loads the conversation header and full message thread, then marks incoming unread messages as read after the page opens.
- The inbox is intentionally page-driven for this milestone: no polling, realtime updates, notifications, or websocket behavior.
- `403` API responses are now handled explicitly so forbidden inbox routes show a clear access message instead of a generic failure.

## HTTP behavior

- Uses native `fetch` only
- Sends `credentials: 'include'` on API requests
- Fetches `/sanctum/csrf-cookie` before register, login, logout, create, update, and delete requests
- Reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN`
- Handles `401`, `419`, `422`, and owner-only `403` responses with focused UI states
