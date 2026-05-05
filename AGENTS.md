<!-- BEGIN:nextjs-agent-rules -->
# λnexus Project Instructions

## Product identity

App name: λnexus

λnexus is the private command center for the λstepweaver AI/system suite.

It is not the memory layer itself.
It is the interface and operating console for reviewing, editing, searching, and processing captured data.

Related layers:
- λlambda: public-facing stepweaver.dev identity/interface
- λcerebro: memory and capture layer
- λnexus: private UI/control layer
- λsigil: lead qualification and signal engine
- λscout: prospecting/outreach agent
- λforge: builder/engineering agent
- λdude: lightweight companion

Always write the brand as λstepweaver.

## Current goal

Build the first private λnexus UI for Cerebro Phase 1.

The existing backend is a VPS-hosted Postgres database populated by a Telegram bot.

Current pipeline:

Telegram → VPS bot → Postgres cerebro_entries row

Do not redesign the database yet.
Use the existing single-table model unless a tiny additive change is clearly necessary.

## Core routes

Build these routes over time:

- /today
- /entries
- /tasks
- /journal
- /ideas
- /questions
- /review
- /settings

Start with:

- /today
- /entries
- /tasks

## MVP features

The MVP should support:

- View today’s entries
- View recent entries
- Filter by entry_type
- Search entries
- Create entries manually
- Edit entries
- Delete entries
- Mark task entries done
- View open tasks
- Run a basic daily review

## Database

Use PostgreSQL.

Main table:

cerebro_entries

Known fields:

- id
- source
- entry_type
- raw_text
- normalized_text
- status
- priority
- entry_date
- telegram_user_id
- telegram_chat_id
- telegram_message_id
- telegram_username
- telegram_first_name
- telegram_message_date
- metadata
- created_at
- updated_at

Assume entry_type may include:

- task
- note
- idea
- journal
- question
- capture

Assume task status may include:

- open
- done

## Security rules

This is a private app.

- Do not expose database credentials to the browser.
- All database access must happen server-side.
- Use environment variables.
- Create .env.example.
- Never commit .env.local.
- Never log raw secrets.
- Do not use production credentials unless explicitly instructed.
- Avoid destructive operations without clear confirmation in the UI.

## Technical preferences

Use:

- Next.js App Router
- TypeScript
- Tailwind
- Server components where practical
- Server actions or route handlers for mutations
- PostgreSQL access from server-only modules
- Zod or equivalent validation if already installed or easy to add

Avoid:

- Prisma for the first pass unless there is a strong reason
- Database migrations before the UI proves what it needs
- Overbuilt auth before the local MVP exists
- AI features in the first UI pass

## UI style

Private dashboard.
Clear, calm, fast.
Terminal-adjacent but not gimmicky.
Readable first.

Visual direction:

- dark interface
- compact cards/tables
- clear type labels
- strong empty states
- fast filters
- mobile usable
- desktop comfortable

## Development rules

- Keep components small.
- Keep database functions centralized.
- Keep mutations validated.
- Prefer boring, understandable code.
- Run typecheck/build before finishing.
- Report files changed and commands run.

## Acceptance criteria for first pass

The first useful version is complete when:

- App runs locally
- /today displays entries grouped by type
- /entries displays recent entries
- /tasks displays open tasks
- Create entry works
- Mark task done works
- Edit/delete are either implemented or clearly stubbed
- .env.example exists
- npm run build passes
<!-- END:nextjs-agent-rules -->
