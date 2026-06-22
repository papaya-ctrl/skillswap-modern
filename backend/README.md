# SkillSwap Backend

Laravel 12 powers the modern SkillSwap API. Milestone 6 adds a private inbox and basic messaging on top of the existing Sanctum SPA authentication, public profiles, posts, and threaded comments.

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

Testing uses `backend/.env.testing` plus `phpunit.xml` and must point to `skillswap_modern_test`.

## Run the backend

```bash
cd backend
/Applications/XAMPP/xamppfiles/bin/php artisan serve --host=localhost --port=8000
```

## Run backend checks

```bash
cd backend
/Applications/XAMPP/xamppfiles/bin/php artisan test tests/Feature/Api
/Applications/XAMPP/xamppfiles/bin/php artisan test tests/Feature/Api/ConversationApiTest.php
/Applications/XAMPP/xamppfiles/bin/php artisan test
/Applications/XAMPP/xamppfiles/bin/php artisan route:list --path=api/conversations
/Applications/XAMPP/xamppfiles/bin/php artisan route:list
```

## Milestone 6 verification notes

- Feed is public and supports `query`, `category_id`, `post_type`, and paginated `per_page`.
- Feed ordering is newest first by `created_at desc`, then `id desc`.
- Post create, update, and delete use `auth:sanctum`.
- The authenticated user is always the post owner on create; `user_id` is never trusted from request input.
- Edit and delete are protected by `PostPolicy`, so users cannot change another user's posts even if they tamper with the frontend.
- `image_path` remains nullable and responses expose `image_url: null` until image upload is added in a later milestone.
- Public profiles return only safe fields: `id`, `name`, `username`, `bio`, `skills_offered`, `skills_wanted`, and `created_at`.
- Profile editing only updates `name`, `username`, `bio`, `skills_offered`, and `skills_wanted`; email and password stay out of scope in this milestone.
- Comments support top-level messages and replies through `parent_id`, and reply parents must belong to the same post.
- Comment deletion is authorized for the comment author or the post owner only.
- Conversation creation accepts only `post_id`, derives the recipient from the post owner, and rejects self-conversations with a validation error.
- Conversations normalize participant order before persistence and reuse an existing row for the same post and two-user pair.
- Conversation read, view, and send rules are enforced by `ConversationPolicy`, so non-participants receive `403` even if they tamper with client requests.
- Message creation accepts only `body`; `sender_id` and `recipient_id` are always derived on the server from the authenticated user and the conversation participants.
- Read tracking only marks unread messages addressed to the current user in the current conversation.
