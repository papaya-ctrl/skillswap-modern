# SkillSwap Modernization Plan

## Summary

This repository is currently a planning workspace plus a legacy reference application in [`legacy-reference/`](/Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/legacy-reference). The legacy app is a flat PHP project that uses server-rendered HTML, vanilla JavaScript, `mysqli`, PHP sessions, public file uploads, and a MySQL database with no migration history in the repo.

This document defines the approved modernization target for Version 1 planning only:

- Frontend: React with Vite
- Styling: Tailwind CSS
- Backend: Laravel REST API
- Authentication: Laravel Sanctum
- Database: MySQL

No dependencies are installed by this document pass. No framework files are generated. `legacy-reference/` remains read-only.

## Legacy Audit

### Confirmed legacy stack

- PHP pages and form handlers
- Vanilla JavaScript with `fetch`
- MySQL through `mysqli`
- PHP session-based login state
- Direct image upload to `legacy-reference/uploads/`
- Mixed response types: full HTML pages, HTML fragments, and JSON endpoints

### Confirmed legacy feature set

- Register, login, logout
- Public post feed
- Create, edit, and delete posts
- Two post types: `offer` and `request`
- Category filtering and keyword search
- Post details page
- Public profiles with authored posts
- Threaded comments through nullable `parent_id`
- Simple inbox, conversations, and messages
- Reviews and comment likes exist in the legacy app, but they are outside the planned V1 migration scope

### Inferred legacy database tables

The repo contains no SQL dump or migration files, so the schema is inferred from query usage:

- `users`
- `posts`
- `comments`
- `comment_likes`
- `conversations`
- `messages`
- `reviews`

### Known legacy problems to address in the migration

- Database credentials are hard-coded in PHP instead of environment configuration.
- There is no versioned schema management in the repo.
- Registration validates format and password length but does not visibly enforce unique username/email before insert.
- The browse page uses infinite scroll, while the approved V1 scope wants normal pagination.
- Legacy messaging includes an authorization gap: `send_message.php` derives the recipient from a conversation without first verifying that the sender is a participant in that conversation.
- File uploads are stored directly in a public folder without a planned storage abstraction.
- Response formats are inconsistent across endpoints, which makes frontend integration harder.
- Reviews, live polling, unread polling badge behavior, comment likes, and extra animation behavior increase complexity and should stay out of V1 unless explicitly approved later.

## Planned Top-Level Folder Structure

The new structure should preserve the legacy app as reference while introducing separate frontend and backend workspaces.

```text
skillswap-modern/
├── docs/
├── legacy-reference/          # read-only legacy PHP reference
├── backend/                   # Laravel API app
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── routes/
│   ├── storage/
│   └── tests/
└── frontend/                  # Vite + React SPA
    ├── public/
    └── src/
```

### Backend structure

```text
backend/app/Models
backend/app/Http/Controllers/Api
backend/app/Http/Requests/Auth
backend/app/Http/Requests/Post
backend/app/Http/Requests/Comment
backend/app/Http/Requests/Conversation
backend/app/Http/Requests/Message
backend/app/Http/Resources
backend/app/Policies
backend/database/migrations
backend/database/seeders
backend/routes/api.php
backend/tests/Feature
```

### Frontend structure

```text
frontend/src/app
frontend/src/routes
frontend/src/layouts
frontend/src/pages
frontend/src/components/common
frontend/src/components/posts
frontend/src/components/comments
frontend/src/components/messaging
frontend/src/services/api
frontend/src/hooks
frontend/src/context
frontend/src/styles
```

## Minimum Required Packages

Only the minimum packages needed for the approved architecture should be installed.

| Package | Required or Optional | Why it is needed |
| --- | --- | --- |
| `laravel/laravel` | Required | Provides the Laravel application skeleton for the REST API. |
| `laravel/sanctum` | Required | Supports SPA authentication with secure cookie-based auth for the React frontend. |
| `react` | Required | Core frontend UI library. |
| `react-dom` | Required | Browser rendering for React. |
| `vite` | Required | Frontend dev server and build tool. |
| `@vitejs/plugin-react` | Required | Enables React support in Vite. |
| `react-router-dom` | Required | Client-side routing for pages like feed, auth, profile, and inbox. |
| `tailwindcss` | Required | Utility-first styling framework approved for the migration. |
| `@tailwindcss/vite` | Required | Official Tailwind integration for Vite. |

### Packages intentionally not required for V1

- Axios
- Redux
- Inertia
- Livewire
- UI component kits
- Realtime chat packages
- Ratings/reviews packages
- Frontend test packages beyond what a future milestone explicitly approves

The current stack can support the planned V1 without those additions.

## Proposed Installation And Generation Commands

These commands are documented for later approval only. They were not executed during this task.

### Scaffold commands

```bash
composer create-project laravel/laravel backend
cd backend
php artisan install:api
cd ..

npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom tailwindcss @tailwindcss/vite
cd ..
```

### Laravel generation commands

```bash
cd backend
php artisan make:model Category -mf
php artisan make:model Post -mf
php artisan make:model Comment -mf
php artisan make:model Conversation -mf
php artisan make:model Message -mf
php artisan make:controller Api/AuthController
php artisan make:controller Api/MeController
php artisan make:controller Api/CategoryController --api
php artisan make:controller Api/PostController --api
php artisan make:controller Api/CommentController --api
php artisan make:controller Api/ConversationController --api
php artisan make:controller Api/MessageController --api
php artisan make:controller Api/ProfileController
php artisan make:request Auth/RegisterRequest
php artisan make:request Auth/LoginRequest
php artisan make:request Post/StorePostRequest
php artisan make:request Post/UpdatePostRequest
php artisan make:request Comment/StoreCommentRequest
php artisan make:request Conversation/StoreConversationRequest
php artisan make:request Message/StoreMessageRequest
php artisan make:policy PostPolicy --model=Post
php artisan make:policy CommentPolicy --model=Comment
php artisan make:policy ConversationPolicy --model=Conversation
php artisan make:seeder CategorySeeder
php artisan make:seeder DemoDataSeeder
php artisan storage:link
```

## Planned Laravel Backend Design

### V1 models

- `User`
- `Category`
- `Post`
- `Comment`
- `Conversation`
- `Message`

### V2-only documented models

- `Review`
- `CommentLike`

### V1 schema outline

- `users`
  - `id`
  - `name`
  - `username`
  - `email`
  - `password`
  - `bio` nullable
  - `skills_offered` nullable
  - `skills_wanted` nullable
  - `timestamps`
- `categories`
  - `id`
  - `name`
  - `slug`
  - `timestamps`
- `posts`
  - `id`
  - `user_id`
  - `category_id`
  - `title`
  - `description`
  - `post_type`
  - `payment_type`
  - `image_path`
  - `timestamps`
- `comments`
  - `id`
  - `post_id`
  - `user_id`
  - `parent_id` nullable
  - `body`
  - `timestamps`
- `conversations`
  - `id`
  - `post_id`
  - `user_one_id`
  - `user_two_id`
  - `timestamps`
  - unique participant pair per post, with application logic normalizing participant order before insert
- `messages`
  - `id`
  - `conversation_id`
  - `sender_id`
  - `recipient_id`
  - `body`
  - `read_at` nullable
  - `timestamps`

### Controllers

- `AuthController`
- `MeController`
- `CategoryController`
- `PostController`
- `CommentController`
- `ConversationController`
- `MessageController`
- `ProfileController`

### Request validation classes

- `RegisterRequest`
- `LoginRequest`
- `StorePostRequest`
- `UpdatePostRequest`
- `StoreCommentRequest`
- `StoreConversationRequest`
- `StoreMessageRequest`

### Core validation rules

- `username`: required, string, min 3, max 30, unique
- `email`: required, valid email, unique
- `password`: required, confirmed, min 8
- `title`: required, string, max 120
- `description`: required, string
- `post_type`: required, in `offer,request`
- `payment_type`: required, in `free,paid,exchange`
- `category_id`: required, exists in `categories`
- `image`: nullable, image, max 5120 KB
- `body` for comments: required, string, max 2000
- `parent_id`: nullable, must reference a comment on the same post
- `post_id` for conversation creation: required, exists in `posts`
- `body` for messages: required, string, max 2000

### Authorization requirements

- Only the post owner may update or delete a post.
- Only the comment author or the related post owner may delete a comment.
- Only conversation participants may view a conversation or its messages.
- Only conversation participants may post messages into a conversation.
- Conversation creation is forbidden on the current user’s own post.
- Conversation creation should deduplicate by post and user pair.
- Message recipients must be derived server-side from the conversation or post owner relationship, never trusted from the client.
- Login should regenerate the session after authentication.

## Planned React Frontend Design

### Routes and pages

- `/` feed page
- `/login`
- `/register`
- `/posts/:postId`
- `/posts/new`
- `/posts/:postId/edit`
- `/profiles/:userId`
- `/dashboard`
- `/inbox`
- `/inbox/:conversationId`
- `*` not-found page

### Shared components

- `AppShell`
- `ProtectedRoute`
- `Navbar`
- `LoadingState`
- `EmptyState`
- `ErrorState`

### Post-related components

- `Hero`
- `PostFeed`
- `PostCard`
- `PostFilters`
- `Pagination`
- `PostForm`
- `PostDetail`

### Comment-related components

- `CommentThread`
- `CommentForm`

### Messaging components

- `ConversationList`
- `MessageList`
- `MessageComposer`

### Frontend API modules

- `httpClient` using `fetch` with `credentials: 'include'`
- `authService`
- `postService`
- `categoryService`
- `profileService`
- `commentService`
- `conversationService`
- `messageService`

### UX requirements carried into V1

- Normal pagination instead of infinite scroll
- Clear loading states for list and detail pages
- Empty states for no posts, no comments, and no conversations
- Clear API error display for auth failures, validation failures, and not-found responses
- Responsive layout for mobile and desktop

## Environment Planning

The future docs and generated examples should cover:

### Backend `.env.example`

- `APP_NAME`
- `APP_URL`
- `FRONTEND_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SESSION_DRIVER`
- `SESSION_DOMAIN`
- `SANCTUM_STATEFUL_DOMAINS`
- `CORS_ALLOWED_ORIGINS`

### Frontend `.env.example`

- `VITE_API_BASE_URL`

## Migration Principles

- Do not modify or remove anything in `legacy-reference/`.
- Do not alter the legacy database in place.
- Build V1 in a separate Laravel-managed schema.
- Use demo seed data for early milestones.
- Defer any one-time legacy import until V1 flows are stable.
- Migrate one complete user flow at a time.
- Keep reviews, comment likes, infinite scroll, and realtime behavior in Version 2 unless the user approves otherwise.
