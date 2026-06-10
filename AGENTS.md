# AGENTS.md

## Project Name

SkillSwap

## Project Goal

Upgrade this existing school project into a realistic, stable and portfolio-quality web application.

SkillSwap is a community platform where users can offer skills, request help and communicate with people who want to exchange knowledge.

Preserve working code where reasonable. Do not rebuild the entire project from zero unless there is a clear technical reason and I approve the change.

## Current Expected Technology Stack

The existing project may use:

* HTML
* CSS
* JavaScript
* PHP
* MySQL

Inspect the repository and confirm the actual stack before modifying source code.

## Version 1 Scope

Focus on:

* Register, login and logout
* User profile
* Skills offered and skills wanted
* Create, edit and delete posts
* Authorization checks
* Two post types: offering a skill and requesting help
* Feed with normal pagination
* Search and category filters
* Post-details page
* Comments
* Simple inbox and basic messages
* Responsive layout
* Clear loading, empty and error states
* Demo data
* Accurate README setup instructions

Move these features to Version 2 unless they already work reliably:

* Real-time live chat
* Ratings and reviews
* Infinite scrolling
* Advanced animations
* Complex page transitions

## Working Rules

1. Work on only one milestone at a time.

2. Before changing files, explain the problem and the intended fix.

3. Prefer small, reviewable changes.

4. Do not rewrite working code without a clear reason.

5. Do not remove existing files until you explain why they are unnecessary.

6. Do not expose passwords, database credentials, tokens, API keys or personal information.

7. Use environment variables when secrets are necessary.

8. Add or update `.env.example` when configuration variables are required.

9. Do not push changes to GitHub automatically.

10. Do not delete the database or overwrite important data without my approval.

11. Keep the code understandable for an IT college student preparing for a job interview.

12. Before adding a new framework, programming language, library, package, database, build tool or external service, stop and report:

* What you want to add
* Why it is necessary
* Whether the current technology stack can solve the problem without it
* Whether it is required or optional
* The advantages and disadvantages
* Which files will be affected
* Which installation or generation commands you plan to run

Do not install, generate or add it until I explicitly approve the change.

13. Do not push changes to GitHub, merge branches or delete branches automatically.

14. Do not move, delete or overwrite the original flat-PHP implementation until the migrated Version 1 has passed manual testing and I explicitly approve the cleanup.

## Approved Modernization Direction

The owner has approved **planning** a controlled migration toward:

* Frontend: React with Vite
* Styling: Tailwind CSS
* Backend: Laravel REST API
* Authentication: Laravel Sanctum where appropriate
* Database: MySQL

Important:

* Approval has been given for migration planning only.
* Do not install dependencies or generate framework files until the migration plan is reviewed and explicitly approved.
* Do not delete or overwrite the original flat-PHP implementation.
* Keep the original implementation available as a reference until the migrated Version 1 has passed manual testing.
* Migrate only one complete user flow at a time.
* Prefer the minimum number of additional packages.
* Report every proposed package before installation.
* Explain whether each package is required or optional.
* Do not introduce Node.js as a backend runtime.
* Node.js and npm may be used only for frontend development tooling unless the owner explicitly approves a backend-stack change.



## Quality Requirements

After every implementation milestone:

1. Run the application.
2. Run available tests.
3. Check terminal errors.
4. Check browser-console errors for web pages.
5. Run linting or formatting checks when available.
6. Review the final diff.
7. Update documentation when behavior changes.
8. Summarize:

   * Files changed
   * Root causes fixed
   * Commands executed
   * Test results
   * Browser checks completed
   * Remaining problems

## Security Review Guidelines

* Verify that users cannot edit or delete another user's posts.
* Verify that users cannot edit or delete another user's comments.
* Verify that users cannot read another user's private messages without authorization.
* Check for SQL injection risks.
* Check for cross-site scripting risks.
* Check password handling.
* Check session handling.
* Do not log passwords, tokens or personal data.

## Definition of Done

A milestone is complete only when:

* The affected user flow works.
* No new critical errors are introduced.
* Error states are handled clearly.
* Security risks are reported.
* The diff is reviewed.
* Documentation remains accurate.
