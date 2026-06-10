# SkillSwap Database Migration Plan

## Summary

The legacy app has no schema dump or tracked migrations in the repository, so the current database must be inferred from PHP code and SQL queries. The modernization plan should not alter the legacy database in place.

Version 1 should use a new Laravel-managed MySQL schema with fresh migrations, fresh seed data, and no dependency on legacy tables during early milestones.

## Legacy Schema Inference

### Confirmed legacy tables from code usage

- `users`
- `posts`
- `comments`
- `comment_likes`
- `conversations`
- `messages`
- `reviews`

### Inferred legacy columns

#### `users`

- `id`
- `username`
- `email`
- `password`
- `created_at`

#### `posts`

- `id`
- `user_id`
- `title`
- `description`
- `post_type`
- `category`
- `payment_type`
- `post_image`
- `created_at`

#### `comments`

- `id`
- `post_id`
- `user_id`
- `comment_body`
- `parent_id`
- `created_at`

#### `comment_likes`

- `id`
- `user_id`
- `comment_id`

#### `conversations`

- `id`
- `user_one_id`
- `user_two_id`
- `post_id`
- `created_at`

#### `messages`

- `id`
- `conversation_id`
- `sender_id`
- `recipient_id`
- `message_body`
- `is_read`
- `sent_at`

#### `reviews`

- `id`
- `reviewer_id`
- `reviewee_id`
- `rating`
- `review_text`
- `created_at`

## Legacy Database Issues

- Category values are stored as strings in `posts` rather than normalized category records.
- The repo does not document indexes, foreign keys, or delete behavior.
- There is no migration history for repeatable setup.
- Legacy table names and field names are not aligned with Laravel conventions.
- Messaging read state uses `is_read`, while the planned Laravel schema should prefer nullable `read_at`.
- Reviews and comment likes add extra tables that are not required for V1.

## Target Version 1 Schema

### Tables included in V1

- `users`
- `categories`
- `posts`
- `comments`
- `conversations`
- `messages`

### Tables deferred to V2

- `reviews`
- `comment_likes`

### Planned V1 table definitions

#### `users`

- `id`
- `username` unique
- `email` unique
- `password`
- `created_at`
- `updated_at`

#### `categories`

- `id`
- `name` unique
- `slug` unique
- `created_at`
- `updated_at`

#### `posts`

- `id`
- `user_id` foreign key
- `category_id` foreign key
- `title`
- `description`
- `post_type`
- `payment_type`
- `image_path` nullable
- `created_at`
- `updated_at`

Suggested constraints:

- `post_type` limited to `offer` and `request`
- `payment_type` limited to `free`, `paid`, and `exchange`

#### `comments`

- `id`
- `post_id` foreign key
- `user_id` foreign key
- `parent_id` nullable self-reference
- `body`
- `created_at`
- `updated_at`

#### `conversations`

- `id`
- `post_id` foreign key
- `user_one_id` foreign key
- `user_two_id` foreign key
- `created_at`
- `updated_at`

Suggested uniqueness rule:

- One conversation per `post_id` plus participant pair

#### `messages`

- `id`
- `conversation_id` foreign key
- `sender_id` foreign key
- `recipient_id` foreign key
- `body`
- `read_at` nullable
- `created_at`
- `updated_at`

## Category Migration Mapping

The legacy UI uses six categories. V1 should seed them into `categories`.

| Legacy label | Planned slug |
| --- | --- |
| Language & Translation | `language-translation` |
| Tech & Digital | `tech-digital` |
| Tutoring & Learning | `tutoring-learning` |
| Health & Wellness | `health-wellness` |
| IT & Programming | `it-programming` |
| Moving & Music | `moving-music` |

## Migration Approach

### Phase 1: Fresh Laravel schema

- Create a brand-new Laravel-managed schema for the modern app.
- Build migrations only for V1 tables.
- Use foreign keys and indexes from the start.
- Normalize categories into a dedicated table.

### Phase 2: Seed demo data

- Seed the six categories.
- Seed demo users, posts, comments, conversations, and messages.
- Keep seed data interview-friendly and small enough for quick resets.

### Phase 3: Optional future legacy import

Only after Milestones 1-7 are stable:

- Build a one-time read-only import script.
- Read from the legacy database without modifying it.
- Map string categories to `category_id`.
- Map `post_image` to the new storage field if those files are intentionally migrated.
- Map `message_body` to `body`.
- Map `sent_at` to `created_at`.
- Map `is_read = 1` to non-null `read_at`.

This import should be optional, not required for launching V1.

## Data Safety Rules

- Do not delete, overwrite, or mutate the legacy database during planning or early implementation.
- Do not point the new Laravel app at the legacy schema as its main runtime database.
- Keep demo data separate from any future import path.
- Treat `legacy-reference/` as application reference, not as a source to edit.

## Indexing And Integrity Recommendations

Add indexes early to support the planned flows:

- `users.email`
- `users.username`
- `posts.user_id`
- `posts.category_id`
- `posts.post_type`
- `posts.created_at`
- `comments.post_id`
- `comments.parent_id`
- `conversations.post_id`
- `conversations.user_one_id`
- `conversations.user_two_id`
- `messages.conversation_id`
- `messages.recipient_id`
- `messages.read_at`

Foreign key guidance:

- Deleting a user should be prevented or handled deliberately once V1 behavior is defined.
- Deleting a post should cascade carefully to comments and optionally conversations, depending on final product rules.
- Deleting a conversation should cascade to messages.

## Assumptions For V1

- Threaded comments remain in scope because legacy already supports replies.
- Reviews are excluded from V1 despite existing in legacy.
- Comment likes are excluded from V1 despite existing in legacy.
- Inbox remains basic and page-driven for V1.
- Fresh demo seed data is preferred over live import for initial development.
