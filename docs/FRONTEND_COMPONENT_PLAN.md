# SkillSwap Frontend Component Plan

## Summary

The V1 frontend should be a React SPA created with Vite and styled with Tailwind CSS. Its job is to replace the legacy PHP page rendering with a clearer, more maintainable client structure while keeping the feature set realistic and stable.

The frontend should consume the Laravel API only. It should not reuse legacy PHP endpoints directly.

## Route Plan

| Route | Page | Access | Purpose |
| --- | --- | --- | --- |
| `/` | `HomePage` | Public | Feed, hero, filters, and normal pagination |
| `/login` | `LoginPage` | Public | User login |
| `/register` | `RegisterPage` | Public | User registration |
| `/posts/:postId` | `PostDetailPage` | Public | Post details and threaded comments |
| `/posts/new` | `CreatePostPage` | Protected | Create a new post |
| `/posts/:postId/edit` | `EditPostPage` | Protected | Edit owned post |
| `/profiles/:userId` | `ProfilePage` | Public | Public profile and authored posts |
| `/dashboard` | `DashboardPage` | Protected | Simple owner dashboard or shortcuts |
| `/inbox` | `InboxPage` | Protected | Conversation list |
| `/inbox/:conversationId` | `ConversationPage` | Protected | Basic message thread |
| `*` | `NotFoundPage` | Public | Fallback route |

## Layout And App Shell

### `AppShell`

Responsibilities:

- Render the main page frame
- Include shared navigation
- Provide spacing and responsive layout
- Hold common loading/error wrappers when useful

### `ProtectedRoute`

Responsibilities:

- Check authenticated user state
- Redirect unauthenticated users to `/login`
- Avoid flashing protected content before auth state finishes loading

### `Navbar`

Responsibilities:

- Show public navigation for logged-out users
- Show create-post, dashboard, inbox, and logout actions for logged-in users
- Display the current username when available

## Page-Level Components

### `HomePage`

Main sections:

- `Hero`
- `PostFilters`
- `PostFeed`
- `Pagination`

Behavior:

- Load categories on first render
- Load feed with `page`, `query`, `category_id`, and `post_type`
- Use normal pagination instead of infinite scroll

### `LoginPage`

Main sections:

- Auth form
- Inline validation messages
- Submit state and API error display

### `RegisterPage`

Main sections:

- Auth form
- Password confirmation input
- Inline validation messages

### `PostDetailPage`

Main sections:

- `PostDetail`
- `CommentForm`
- `CommentThread`

Behavior:

- Load one post by ID
- Render nested comments
- Show edit/delete actions only when allowed
- Show comment form only for authenticated users

### `CreatePostPage`

Main sections:

- `PostForm`

Behavior:

- Load categories before form use
- Support optional image upload

### `EditPostPage`

Main sections:

- `PostForm`

Behavior:

- Load post details
- Pre-fill the form
- Guard access through backend permissions and protected routing

### `ProfilePage`

Main sections:

- `ProfileHeader`
- `ProfilePostList`

Behavior:

- Show public user info
- Show the user’s authored posts
- Exclude ratings/reviews in V1

### `DashboardPage`

Main sections:

- Shortcuts to create post, view own profile, and open inbox
- Optional list of the current user’s recent posts in a later refinement

Keep this page simple in V1.

### `InboxPage`

Main sections:

- `ConversationList`
- Empty state when no conversations exist

### `ConversationPage`

Main sections:

- Header with other user and source post
- `MessageList`
- `MessageComposer`

Behavior:

- Load messages in chronological order
- Support sending new messages
- Mark messages as read when opening the thread
- No realtime requirement in V1

## Reusable UI Components

### Common

- `LoadingState`
- `EmptyState`
- `ErrorState`
- `PageHeader`
- `Button`
- `TextInput`
- `Textarea`
- `Select`

### Posts

- `Hero`
- `PostFeed`
- `PostCard`
- `PostFilters`
- `Pagination`
- `PostForm`
- `PostDetail`

### Comments

- `CommentThread`
- `CommentItem`
- `CommentForm`

### Messaging

- `ConversationList`
- `ConversationListItem`
- `MessageList`
- `MessageBubble`
- `MessageComposer`

## API Service Modules

Place these under `frontend/src/services/api`.

### `httpClient`

Responsibilities:

- Wrap `fetch`
- Always send `credentials: 'include'`
- Attach JSON headers when appropriate
- Normalize error handling

### `authService`

Methods:

- `register(payload)`
- `login(payload)`
- `logout()`
- `getMe()`

### `categoryService`

Methods:

- `list()`

### `postService`

Methods:

- `list(params)`
- `getById(postId)`
- `create(formData)`
- `update(postId, formData)`
- `remove(postId)`

### `profileService`

Methods:

- `getByUserId(userId)`

### `commentService`

Methods:

- `create(postId, payload)`
- `remove(commentId)`

### `conversationService`

Methods:

- `list()`
- `create(payload)`
- `getById(conversationId)`
- `markRead(conversationId)`

### `messageService`

Methods:

- `list(conversationId)`
- `create(conversationId, payload)`

## State Planning

### Global state

Keep global state minimal:

- Authenticated user
- Auth loading state

This can live in `src/context`.

### Page-local state

Keep these page-local unless growth requires refactoring:

- Feed filters and pagination
- Form submission state
- Comment reply state
- Conversation message input state

## Loading, Empty, And Error State Rules

Every page in V1 should have explicit non-happy-path behavior.

### Loading states

- Feed page while fetching posts
- Post detail while loading post and comments
- Profile page while loading user data
- Inbox and conversation pages while loading protected data
- Buttons should reflect submitting state

### Empty states

- No posts in feed
- No posts matching current filters
- No comments on a post
- No authored posts on a profile
- No conversations in inbox

### Error states

- Invalid login credentials
- Registration validation failures
- 404 post not found
- 404 profile not found
- Unauthorized edit/delete attempts
- Conversation access denied
- Failed message send

## Styling Direction

- Use Tailwind CSS utilities for layout, spacing, type, and states.
- Keep the interface interview-friendly and understandable.
- Prefer a clean, warm, community-oriented look over heavy animation.
- Preserve responsive behavior from the start instead of treating it as a final polish item.

## Out Of Scope For V1

- Realtime chat
- Message polling
- Unread badge polling
- Ratings and reviews
- Comment likes
- Infinite scroll
- Complex transitions
