# Portfolio Screenshots Guide

Take screenshots only after final QA passes.

## Goal

Capture clean, consistent images that show SkillSwap Modern as a stable Version 1 portfolio project.

## Rules

- Use seeded demo data
- Use one consistent desktop width for the main portfolio images
- Keep browser zoom at 100%
- Use a clean browser state with no devtools open
- Avoid screenshots with validation errors unless you want one separate QA example
- Do not commit image binaries in this milestone unless separately requested

## Required Screenshots

1. Home feed
2. Post detail
3. Create post form
4. Profile page
5. Comments section
6. Inbox list
7. Conversation page
8. Dashboard with authenticated navbar

## Suggested Filenames

- `01-home-feed.png`
- `02-post-detail.png`
- `03-create-post.png`
- `04-profile-page.png`
- `05-comments-section.png`
- `06-inbox-list.png`
- `07-conversation-page.png`
- `08-dashboard-auth-state.png`

## Capture Notes By Screen

### Home feed

- Show navbar, hero section, filters, and at least several post cards
- Prefer a state with real seeded posts and default filters

### Post detail

- Show the title, badges, author panel, and comments entry point

### Create post form

- Show the form with empty valid fields or realistic example text
- Do not show broken validation unless you want an extra QA-only image

### Profile page

- Show public profile data and the member’s authored posts

### Comments section

- Show one top-level comment and one nested reply if available

### Inbox list

- Show multiple conversation rows if seeded data is available

### Conversation page

- Show the header, message thread, and composer

### Dashboard

- Show the signed-in navbar state and dashboard shortcuts

## Optional Mobile Screenshot

If you want one extra image to prove responsiveness, capture one mobile layout at `390x844`.

Suggested optional filename:

- `09-mobile-home-feed.png`
