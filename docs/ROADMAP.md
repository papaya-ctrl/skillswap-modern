# SkillSwap Roadmap

## Summary

This roadmap breaks the modernization effort into controlled milestones that match the approved migration sequence. Each milestone should be completed, reviewed, and manually checked before the next one begins.

## Milestone 1: Create The React, Tailwind, And Laravel Foundations

### Goal

Set up separate `backend/` and `frontend/` workspaces without touching `legacy-reference/`.

### Entry criteria

- Planning docs approved
- Package list approved
- Installation commands approved

### Exit criteria

- Laravel app scaffolded
- Sanctum installed and configured for SPA auth
- React Vite app scaffolded
- Tailwind wired into the frontend
- Basic frontend-backend connectivity plan documented in README notes

### Dependencies

- Approval to run install and scaffold commands

### Manual checks

- Backend can start locally
- Frontend can start locally
- No legacy files changed

## Milestone 2: Create The MySQL Schema, Models, And Demo Seed Data

### Goal

Create the V1 database structure in Laravel and populate it with demo content.

### Entry criteria

- Milestone 1 complete

### Exit criteria

- Migrations created for `users`, `categories`, `posts`, `comments`, `conversations`, and `messages`
- Relationships defined in models
- Category seeder created for the six legacy categories
- Demo seed data added for users, posts, comments, conversations, and messages
- Migration and seeder tests added where available

### Dependencies

- Working Laravel foundation
- Approved MySQL configuration

### Manual checks

- Fresh migration succeeds
- Demo seed succeeds
- Schema matches documented V1 design

## Milestone 3: Implement Registration, Login, Logout, And Authorization

### Goal

Deliver secure auth flows and the auth state contract used by the frontend.

### Entry criteria

- Milestone 2 complete

### Exit criteria

- `POST /register`, `POST /login`, `POST /logout`, and `GET /me` implemented
- Sanctum SPA auth works
- Session regeneration on login confirmed
- Protected frontend routes working
- Auth feature tests and authorization tests added

### Dependencies

- Users table and seed data
- Sanctum configuration

### Manual checks

- Register works
- Login works
- Logout works
- Unauthenticated users cannot access protected pages

## Milestone 4: Implement Posts, Categories, Search, And Pagination

### Goal

Deliver the main public feed and post CRUD.

### Entry criteria

- Milestone 3 complete

### Exit criteria

- Categories endpoint works
- Public feed supports keyword search, category filter, post type filter, and normal pagination
- Post detail endpoint works
- Create, edit, and delete post endpoints work
- Frontend feed and post form pages work
- Owner-only post editing and deletion enforced

### Dependencies

- Auth complete
- Categories and posts schema complete

### Manual checks

- Feed loads with pagination
- Search works
- Filters work
- Users cannot edit or delete other users’ posts

## Milestone 5: Implement Profiles And Comments

### Goal

Deliver public profile pages and threaded comments.

### Entry criteria

- Milestone 4 complete

### Exit criteria

- Public profile endpoint works
- Profile page shows authored posts
- Comment creation and deletion endpoints work
- Reply comments work through `parent_id`
- Comment delete policy allows comment owner or post owner only

### Dependencies

- Posts complete
- Comments schema complete

### Manual checks

- Public profiles load
- Top-level comments and replies work
- Users cannot delete unrelated comments

## Milestone 6: Implement Basic Inbox And Messaging

### Goal

Deliver private messaging with proper conversation authorization.

### Entry criteria

- Milestone 5 complete

### Exit criteria

- Conversation create/list/detail endpoints work
- Message list/create/read endpoints work
- Frontend inbox and conversation pages work
- Conversation access restricted to participants
- Messaging authorization gap from legacy flow is closed

### Dependencies

- Auth complete
- Posts complete
- Conversation and message schema complete

### Manual checks

- Users can start a conversation from another user’s post
- Users cannot start a conversation on their own post
- Users cannot read or send messages in other users’ conversations

## Milestone 7: Complete Responsive UI, Error States, Tests, And README

### Goal

Stabilize the application for portfolio-quality Version 1.

### Entry criteria

- Milestone 6 complete

### Exit criteria

- Responsive layouts verified for core pages
- Clear loading, empty, and error states implemented
- Feature tests updated across main flows
- Browser checks completed on major pages
- README updated with accurate setup instructions

### Dependencies

- All V1 flows implemented

### Manual checks

- Mobile and desktop layouts checked
- Browser console checked
- Terminal errors checked
- README tested against a fresh setup path

## Milestone 8: Optional Version 2 Features

### Goal

Document deferred enhancements that are intentionally outside V1.

### Candidate features

- Ratings and reviews
- Comment likes
- Realtime chat
- Message polling or unread badge polling
- Infinite scroll
- Advanced animations and transitions

### Entry criteria

- Milestones 1-7 complete and stable

### Exit criteria

- V2 scope explicitly approved before implementation begins

## Acceptance Rules For Every Milestone

- The affected user flow works end-to-end.
- No new critical errors are introduced.
- Authorization rules are verified.
- The final diff is reviewed.
- Documentation remains accurate.
- Remaining problems are reported clearly.
