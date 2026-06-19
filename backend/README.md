# SkillSwap Backend

Laravel 12 powers the new SkillSwap API. Milestone 3 adds cookie-based SPA authentication with Laravel Sanctum for the React frontend.

## Auth endpoints

- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /api/me`
- `GET /sanctum/csrf-cookie`

## Local environment

Copy `.env.example` to `.env` and set values for your machine.

Required auth-related values:

- `APP_URL=http://localhost:8000`
- `FRONTEND_URL=http://localhost:5173`
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173`
- `DB_CONNECTION=mysql`
- `DB_DATABASE=skillswap_modern`
- `SESSION_DRIVER=database`

Testing uses `backend/.env.testing` and must point to `skillswap_modern_test`.

## Run the backend

```bash
cd backend
/Applications/XAMPP/xamppfiles/bin/php artisan serve --host=localhost --port=8000
```

## Run backend tests

```bash
cd backend
/Applications/XAMPP/xamppfiles/bin/php artisan test tests/Feature/Auth
/Applications/XAMPP/xamppfiles/bin/php artisan test
```

## Auth verification notes

- The frontend must send requests with `credentials: 'include'`.
- The frontend must fetch `/sanctum/csrf-cookie` before register, login, and logout.
- `POST /register` creates the account but does not log the user in.
- `POST /login` regenerates the session on success.
- `POST /logout` invalidates the session and regenerates the CSRF token.
- `GET /api/me` returns only `id`, `name`, `username`, and `email`.
