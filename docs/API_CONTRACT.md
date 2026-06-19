# SkillSwap API Contract

## Summary

This document defines the planned Version 1 REST API contract for the Laravel backend. It is designed for a React SPA using cookie-based authentication through Laravel Sanctum.

The contract intentionally covers V1 features only:

- Authentication
- Categories
- Posts
- Profiles
- Comments
- Conversations
- Messages

It intentionally excludes Version 2 features:

- Reviews
- Comment likes
- Realtime chat
- Infinite scroll APIs

## Authentication Model

### Planned auth approach

- React frontend and Laravel backend run as separate apps.
- The frontend sends requests with `credentials: 'include'`.
- Laravel Sanctum manages SPA authentication through cookies and session state.
- Protected endpoints return `401 Unauthorized` when the user is not logged in.
- The frontend must fetch `GET /sanctum/csrf-cookie` before `POST /register`, `POST /login`, and `POST /logout`.

### Auth flow

1. Frontend loads and checks current auth state with `GET /api/me`.
2. User submits registration or login form.
3. Registration creates the account only and returns a success message that tells the user to log in next.
4. Login authenticates the user, regenerates the session, and returns the authenticated user.
5. Frontend stores only UI state. Auth remains server-side.
6. Logout clears the server session and returns success.

## Response Conventions

### Success response shape

```json
{
  "data": {}
}
```

### Paginated response shape

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 9,
    "total": 0
  },
  "links": {
    "prev": null,
    "next": null
  }
}
```

### Validation error shape

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Validation message."
    ]
  }
}
```

### General error shape

```json
{
  "message": "Human-readable error message."
}
```

## Resource Shapes

### User summary

```json
{
  "id": 1,
  "name": "Alice Example",
  "username": "alice",
  "email": "alice@example.com"
}
```

### Category

```json
{
  "id": 1,
  "name": "IT & Programming",
  "slug": "it-programming"
}
```

### Post

```json
{
  "id": 10,
  "title": "Need help learning JavaScript basics",
  "description": "Looking for beginner-friendly tutoring.",
  "post_type": "request",
  "payment_type": "exchange",
  "image_url": null,
  "created_at": "2026-06-11T10:00:00Z",
  "updated_at": "2026-06-11T10:00:00Z",
  "author": {
    "id": 2,
    "name": "Bob Example",
    "username": "bob"
  },
  "category": {
    "id": 1,
    "name": "IT & Programming",
    "slug": "it-programming"
  },
  "permissions": {
    "can_edit": false,
    "can_delete": false
  }
}
```

### Comment

```json
{
  "id": 55,
  "body": "I can help with this.",
  "parent_id": null,
  "created_at": "2026-06-11T10:00:00Z",
  "author": {
    "id": 3,
    "username": "charlie"
  },
  "permissions": {
    "can_delete": true
  },
  "replies": []
}
```

### Profile

```json
{
  "id": 2,
  "username": "bob",
  "joined_at": "2026-06-11T10:00:00Z",
  "posts": []
}
```

### Conversation summary

```json
{
  "id": 7,
  "post": {
    "id": 10,
    "title": "Need help learning JavaScript basics"
  },
  "other_user": {
    "id": 2,
    "username": "bob"
  },
  "last_message": {
    "id": 101,
    "body": "Let’s schedule a time.",
    "sender_id": 2,
    "created_at": "2026-06-11T10:00:00Z"
  },
  "unread_count": 1
}
```

### Message

```json
{
  "id": 101,
  "body": "Let’s schedule a time.",
  "sender_id": 2,
  "recipient_id": 1,
  "created_at": "2026-06-11T10:00:00Z",
  "read_at": null
}
```

## Public Endpoints

### `POST /register`

Creates a new user account. This endpoint does not authenticate the new user.

Request:

```json
{
  "name": "Alice Example",
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

Validation:

- `name`: required, string, max 255
- `username`: required, string, min 3, max 30, unique
- `email`: required, valid email, unique
- `password`: required, confirmed, min 8

Response:

```json
{
  "data": {
    "message": "Registration successful. Please log in.",
    "user": {
      "id": 1,
      "name": "Alice Example",
      "username": "alice",
      "email": "alice@example.com"
    }
  }
}
```

### `POST /login`

Authenticates an existing user and regenerates the session.

Request:

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Validation:

- `email`: required, valid email
- `password`: required

Response:

```json
{
  "data": {
    "message": "Login successful.",
    "user": {
      "id": 1,
      "name": "Alice Example",
      "username": "alice",
      "email": "alice@example.com"
    }
  }
}
```

### `GET /api/categories`

Returns the six V1 categories.

Response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Language & Translation",
      "slug": "language-translation"
    }
  ]
}
```

### `GET /api/posts`

Returns the public feed with normal pagination.

Query parameters:

- `page`: integer, default `1`
- `per_page`: integer, default `9`, max `24`
- `query`: optional keyword search against title and description
- `category_id`: optional category filter
- `post_type`: optional `offer` or `request`

Response:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 9,
    "total": 0
  },
  "links": {
    "prev": null,
    "next": null
  }
}
```

### `GET /api/posts/{post}`

Returns one public post with its category, author, and owner-only permissions.

Authorization:

- Public

Response:

```json
{
  "data": {
    "id": 10,
    "title": "Need help learning JavaScript basics",
    "description": "Looking for beginner-friendly tutoring.",
    "post_type": "request",
    "payment_type": "exchange",
    "image_url": null,
    "author": {
      "id": 2,
      "name": "Bob Example",
      "username": "bob"
    },
    "category": {
      "id": 1,
      "name": "IT & Programming",
      "slug": "it-programming"
    },
    "permissions": {
      "can_edit": false,
      "can_delete": false
    }
  }
}
```

### `GET /profiles/{user}`

Returns the user’s public profile plus authored posts.

Authorization:

- Public

## Protected Endpoints

All protected endpoints require an authenticated user.

### `POST /logout`

Ends the current authenticated session.

Response:

```json
{
  "data": {
    "message": "Logged out successfully."
  }
}
```

### `GET /api/me`

Returns the currently authenticated user.

Response:

```json
{
  "data": {
    "id": 1,
    "name": "Alice Example",
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

### `POST /api/posts`

Creates a new post.

Request:

```json
{
  "title": "Offering beginner Python tutoring",
  "description": "I can help with Python basics.",
  "post_type": "offer",
  "payment_type": "free",
  "category_id": 1
}
```

Validation:

- `title`: required, string, max 120
- `description`: required, string
- `post_type`: required, in `offer,request`
- `payment_type`: required, in `free,paid,exchange`
- `category_id`: required, exists

Response:

```json
{
  "data": {
    "message": "Post created successfully.",
    "post": {
      "id": 10
    }
  }
}
```

### `PUT /api/posts/{post}`

Updates a post.

Authorization:

- Post owner only

Validation:

- Same as create

Response:

```json
{
  "data": {
    "message": "Post updated successfully.",
    "post": {
      "id": 10
    }
  }
}
```

### `DELETE /api/posts/{post}`

Deletes a post.

Authorization:

- Post owner only

Response:

```json
{
  "data": {
    "message": "Post deleted successfully."
  }
}
```

### `POST /posts/{post}/comments`

Creates a new top-level comment or reply.

Request:

```json
{
  "body": "I can help with this.",
  "parent_id": null
}
```

Validation:

- `body`: required, string, max 2000
- `parent_id`: nullable, must belong to the same post

### `DELETE /comments/{comment}`

Deletes a comment.

Authorization:

- Comment author or the related post owner

### `GET /conversations`

Returns the authenticated user’s conversation list.

### `POST /conversations`

Creates or reuses a conversation for a post.

Request:

```json
{
  "post_id": 10
}
```

Validation:

- `post_id`: required, exists in `posts`

Authorization rules:

- User cannot create a conversation on their own post.
- Backend deduplicates by post and user pair.

### `GET /conversations/{conversation}`

Returns conversation metadata for a participant.

Authorization:

- Participant only

### `GET /conversations/{conversation}/messages`

Returns messages in chronological order.

Authorization:

- Participant only

### `POST /conversations/{conversation}/messages`

Creates a new message in a conversation.

Request:

```json
{
  "body": "Hello, I’m interested in your post."
}
```

Validation:

- `body`: required, string, max 2000

Authorization:

- Participant only

Important backend rule:

- `recipient_id` is derived server-side and never accepted from the client.

### `POST /conversations/{conversation}/read`

Marks messages sent to the current user as read.

Authorization:

- Participant only

Response:

```json
{
  "data": {
    "message": "Conversation marked as read."
  }
}
```

## Status Code Rules

- `200 OK`: successful read or update
- `201 Created`: successful create
- `204 No Content`: optional delete response if used consistently
- `401 Unauthorized`: not logged in
- `403 Forbidden`: logged in but not allowed
- `404 Not Found`: resource does not exist or is not visible to the user
- `422 Unprocessable Entity`: validation failure

## Version 1 Security Rules

- Never trust `user_id`, `recipient_id`, or ownership information from the client.
- Always derive permissions from the authenticated user and database state.
- Prevent unauthorized message posting by enforcing conversation participant checks on every message endpoint.
- Escape or sanitize rendered text on the frontend as needed, but treat backend validation and serialization as the main trust boundary.
