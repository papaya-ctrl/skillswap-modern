# SkillSwap Backend

Laravel 12 powers the SkillSwap Modern REST API, including authentication, posts, profiles, comments, messaging, and secure image uploads.

For the full project setup path, start with the root [README.md](../README.md).

## Current API areas

- Auth: `POST /register`, `POST /login`, `POST /logout`, `GET /api/me`, `GET /sanctum/csrf-cookie`
- Categories: `GET /api/categories`
- Posts: `GET /api/posts`, `GET /api/posts/{post}`, `POST /api/posts`, `PUT /api/posts/{post}`, `DELETE /api/posts/{post}`
- Profiles: `GET /api/profiles/{user}`, `PUT /api/me/profile`
- Comments: `GET /api/posts/{post}/comments`, `POST /api/posts/{post}/comments`, `DELETE /api/comments/{comment}`
- Conversations: `GET /api/conversations`, `POST /api/conversations`, `GET /api/conversations/{conversation}`, `GET /api/conversations/{conversation}/messages`, `POST /api/conversations/{conversation}/messages`, `POST /api/conversations/{conversation}/read`

## Local environment

Copy `.env.example` to `.env` and set values for your machine.

Required local values:

- `APP_URL=http://localhost:8000`
- `FRONTEND_URL=http://localhost:5173`
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173`
- `DB_CONNECTION=mysql`
- `DB_DATABASE=skillswap_modern`
- `SESSION_DRIVER=database`
- `APP_URL` must match the backend URL so post image URLs are generated correctly.

Testing uses `backend/.env.testing` plus `phpunit.xml` and must point to `skillswap_modern_test`.

## Run the backend

```bash
cd backend
/Applications/XAMPP/xamppfiles/bin/php artisan serve --host=localhost --port=8000
```

If post images do not load locally, create the public storage link once:

```bash
cd backend
/Applications/XAMPP/xamppfiles/bin/php artisan storage:link
```

## Run backend checks

```bash
cd backend
/Applications/XAMPP/xamppfiles/bin/php artisan test
```

## API behavior and security

- Feed is public and supports `query`, `category_id`, `post_type`, and paginated `per_page`.
- Feed ordering is newest first by `created_at desc`, then `id desc`.
- Post create, update, and delete use `auth:sanctum`.
- The authenticated user is always the post owner on create; `user_id` is never trusted from request input.
- Edit and delete are protected by `PostPolicy`, so users cannot change another user's posts even if they tamper with the frontend.
- Post images are optional, stored on Laravel's `public` filesystem disk under `post-images/`, and saved in the database only as safe relative paths.
- Post responses expose `image_url` for display and never expose raw server filesystem paths.
- Public profiles return only safe fields: `id`, `name`, `username`, `bio`, `skills_offered`, `skills_wanted`, and `created_at`.
- Profile editing only updates `name`, `username`, `bio`, `skills_offered`, and `skills_wanted`; email and password stay out of scope in this milestone.
- Comments support top-level messages and replies through `parent_id`, and reply parents must belong to the same post.
- Comment deletion is authorized for the comment author or the post owner only.
- Conversation creation accepts only `post_id`, derives the recipient from the post owner, and rejects self-conversations with a validation error.
- Conversations normalize participant order before persistence and reuse an existing row for the same post and two-user pair.
- Conversation read, view, and send rules are enforced by `ConversationPolicy`, so non-participants receive `403` even if they tamper with client requests.
- Message creation accepts only `body`; `sender_id` and `recipient_id` are always derived on the server from the authenticated user and the conversation participants.
- Read tracking only marks unread messages addressed to the current user in the current conversation.

## Verification notes

- Continue using MySQL databases `skillswap_modern` and `skillswap_modern_test`.
- Do not introduce SQLite files in `backend/database/`.
- Keep public API shapes stable while polishing frontend state handling and documentation.
