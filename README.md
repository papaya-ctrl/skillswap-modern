# SkillSwap Modern

SkillSwap Modern is a portfolio-ready Version 1 rebuild of the original school project. It keeps the idea of a community skill-sharing platform, but moves the app to a cleaner Laravel API + React frontend structure.

Simple English portfolio summary:
SkillSwap Modern is a web app where users can register, create skill posts, comment, view profiles, and send basic private messages. This version focuses on secure ownership checks, clear empty/error states, normal pagination, and a responsive interface.

Japanese portfolio summary:
SkillSwap Modern は、スキルを教えたい人と学びたい人をつなぐコミュニティアプリです。Laravel REST API と React を使って再構築し、認証、投稿管理、コメント、プロフィール、簡単なメッセージ機能、レスポンシブ対応を含む安定した V1 を目指しています。

## Tech Stack

- Backend: Laravel 12, PHP 8.2, Sanctum
- Frontend: React 19, Vite
- Styling: project CSS in `frontend/src/index.css` with Tailwind available in the toolchain
- Database: MySQL / MariaDB
- Local stack expected by this repo: XAMPP, Composer, Node.js, npm

## Version 1 Features

- Register, login, logout
- Protected dashboard
- Public feed with keyword search, category filter, post-type filter, and normal pagination
- Create, edit, and delete your own posts
- Public profile pages
- Edit your own profile
- Post detail pages
- Threaded comments
- Inbox and conversation pages
- Responsive layout and shared loading, empty, and error states
- Demo data for local review

## Project Structure

```text
skillswap-modern/
├── backend/            Laravel API
├── docs/               planning and QA docs
├── frontend/           React + Vite SPA
└── legacy-reference/   original flat PHP reference app (do not modify)
```

## Requirements

- XAMPP with PHP and MySQL/MariaDB available
- Composer
- Node.js and npm

Verified local paths used in this project:

- PHP: `/Applications/XAMPP/xamppfiles/bin/php`
- MySQL: `/Applications/XAMPP/xamppfiles/bin/mysql`

## Database Setup

Create the two approved databases:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS skillswap_modern CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS skillswap_modern_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

- App database: `skillswap_modern`
- Test database: `skillswap_modern_test`
- Do not use SQLite for this project
- Do not point this modern app to the legacy database

## Backend Setup

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/backend
composer install
test -f .env || cp .env.example .env
/Applications/XAMPP/xamppfiles/bin/php artisan key:generate
/Applications/XAMPP/xamppfiles/bin/php artisan migrate
/Applications/XAMPP/xamppfiles/bin/php artisan db:seed
```

Important backend environment values:

- `APP_URL=http://localhost:8000`
- `FRONTEND_URL=http://localhost:5173`
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173`
- `DB_CONNECTION=mysql`
- `DB_DATABASE=skillswap_modern`
- `SESSION_DRIVER=database`

Testing uses `backend/.env.testing` and must stay on `skillswap_modern_test`.

## Frontend Setup

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/frontend
npm install
test -f .env || cp .env.example .env
```

Frontend environment value:

- `VITE_API_BASE_URL=http://localhost:8000`

## Run The App

Start the backend:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/backend
/Applications/XAMPP/xamppfiles/bin/php artisan serve --host=localhost --port=8000
```

Start the frontend in another terminal:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/frontend
npm run dev -- --host localhost --port 5173
```

Open:

- Frontend: `http://localhost:5173`
- Backend API base: `http://localhost:8000`

## Demo Accounts

All demo users use the same password:

- Password: `demo-password`

Suggested demo logins:

- `maya.demo@example.test`
- `leo.demo@example.test`
- `aisha.demo@example.test`
- `noah.demo@example.test`

## Test Commands

Backend:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/backend
/Applications/XAMPP/xamppfiles/bin/php artisan test
```

Frontend:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/frontend
npm run lint
npm run build
```

Repo checks:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/skillswap-modern
git diff --check
find backend -name '*.sqlite' -print
git diff --name-only -- backend/composer.json backend/composer.lock backend/package.json frontend/package.json frontend/package-lock.json
git diff -- backend/composer.json backend/composer.lock backend/package.json frontend/package.json frontend/package-lock.json
git diff --cached --name-only
git diff --cached --name-only | rg '(^|/)(\\.env($|\\.)|node_modules|vendor|dist|public/build|storage|legacy-reference|.*\\.log$)'
git status --short
git ls-files --others --exclude-standard
```

## Manual QA

- Manual checklist: [docs/MANUAL_TEST_CHECKLIST.md](/Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/docs/MANUAL_TEST_CHECKLIST.md)
- Screenshot guide: [docs/PORTFOLIO_SCREENSHOTS.md](/Applications/XAMPP/xamppfiles/htdocs/skillswap-modern/docs/PORTFOLIO_SCREENSHOTS.md)

## Screenshot Placeholders

Planned portfolio images:

- Home feed
- Post detail
- Create post form
- Profile page
- Comments section
- Inbox list
- Conversation page
- Dashboard with authenticated navbar

## Notes

- `legacy-reference/` is kept only as a reference and should remain untouched during modern-app milestones.
- This V1 intentionally does not add ratings, reviews, realtime chat, notifications, image upload, or infinite scrolling.
