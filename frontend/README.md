# SkillSwap Frontend

This React + Vite frontend now covers the Milestone 4 public feed and post CRUD flow on top of the Milestone 3 Sanctum auth shell.

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

- Public: `/`, `/login`, `/register`, `/posts/:postId`
- Protected: `/dashboard`, `/posts/new`, `/posts/:postId/edit`

## Milestone 4 behavior

- Home page is now the public feed with keyword, category, and post-type filters.
- Feed uses normal pagination and links every card to a public post-detail page.
- Authenticated users can create posts, edit their own posts, and delete their own posts.
- Owner-only actions are hidden unless the API returns `permissions.can_edit` or `permissions.can_delete`.
- Create, edit, and delete all stay inside the SPA and redirect after success.

## HTTP behavior

- Uses native `fetch` only
- Sends `credentials: 'include'` on API requests
- Fetches `/sanctum/csrf-cookie` before register, login, logout, create, update, and delete requests
- Reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN`
- Handles `401`, `419`, `422`, and owner-only `403` responses with focused UI states
