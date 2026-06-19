# SkillSwap Frontend

This React + Vite frontend includes the Milestone 3 authentication shell for SkillSwap.

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

## Auth flow

- Public routes: `/`, `/login`, `/register`
- Protected route: `/dashboard`
- App boot checks `GET /api/me`
- Register sends the user back to `/login` with a success message
- Login updates React auth state and redirects to `/dashboard`
- Logout clears auth state and redirects to `/`

## HTTP behavior

- Uses native `fetch` only
- Sends `credentials: 'include'` on API requests
- Fetches `/sanctum/csrf-cookie` before register, login, and logout
- Reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN`
- Handles `401`, `419`, and validation errors with focused UI messages
