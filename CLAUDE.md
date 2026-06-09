# twikkies

Personal sticky-note app. Minimal, monotone + amber, masonry layout. Backed by Postgres, deployed on a personal server.

## Stack

- **Frontend**: Vite + React + TypeScript (`frontend/`)
- **Backend**: Node.js + Express + TypeScript (`frontend/`)
- **DB**: PostgreSQL 15 (Docker for local dev, native on server)
- **Auth**: JWT in httpOnly cookie, 30-day expiry
- **Proxy**: nginx → Node :3000 in production

## Local dev

```bash
# Start postgres (port 6555 to avoid conflicts)
docker-compose up -d

# Backend (port 3000)
cd backend && npm run dev

# Frontend (port 5173 or 5174 if 5173 is taken)
cd frontend && npm run dev
```

Vite proxies `/api` → `http://localhost:3000`.

## DB migration

```bash
cd backend && npm run migrate
```

The script sources `backend/.env` automatically. Uses `bash -c 'set -a && . .env && ...'` because npm scripts don't load `.env`.

## Adding a user

Users are inserted manually — there is no signup UI (personal-use app).

**Always use a SQL file or heredoc** when inserting bcrypt hashes. Bcrypt hashes contain `$` characters that bash expands as variables inside double quotes.

```bash
# Generate hash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('yourpassword', 10));"

# Insert safely via heredoc
cat > /tmp/add_user.sql << 'EOF'
INSERT INTO users(username, password_hash) VALUES('yourname', '$2a$10$...');
EOF
psql $DATABASE_URL -f /tmp/add_user.sql
```

## Production deploy

```bash
# Build frontend (output goes to frontend/dist/)
cd frontend && npm run build

# Install nginx config
sudo cp nginx/twikkie.conf /etc/nginx/sites-enabled/twikkie
sudo nginx -s reload

# Start backend (serves frontend/dist/ as static files)
cd backend && NODE_ENV=production npm start
```

## Project layout

```
backend/
  src/
    db/
      index.ts               pg Pool
      migrations/001_init.sql
    middleware/auth.ts        JWT verify, attaches req.userId
    routes/
      auth.ts                POST /api/auth/login, /logout, GET /me
      memos.ts               CRUD + /archive /restore
      accounts.ts            social accounts (X / Bluesky)
    index.ts                 Express entry point
frontend/
  src/
    api.ts                   fetch wrapper for all API calls
    types.ts                 shared types + date/filter utilities
    App.tsx                  top-level state, all API actions
    components/
      ui/                    Icon, Logo, PlatMark, Menu, ConfirmDialog
      Login, TopBar, FilterBar, Composer
      MemoCard (+ MemoGrid), EditorModal, PostDialog
      ArchiveModal, AccountsModal
    hooks/
      useEscape.ts
      useToasts.tsx
nginx/twikkie.conf
docker-compose.yml           postgres:15 on port 6555
.env.example
```

## API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Set JWT cookie |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/auth/me` | Current user (used on app load) |
| GET | `/api/memos` | Active memos, newest first |
| POST | `/api/memos` | Create memo |
| PUT | `/api/memos/:id` | Update text / image / stats |
| POST | `/api/memos/:id/archive` | Soft-delete |
| POST | `/api/memos/:id/restore` | Un-archive |
| DELETE | `/api/memos/:id` | Permanent delete |
| GET | `/api/memos/archived` | Archived memos |
| GET | `/api/accounts` | Social accounts |
| POST | `/api/accounts` | Add account |
| DELETE | `/api/accounts/:id` | Remove account |

## Design decisions

- No signup or forgot-password UI — users are inserted directly into DB
- Archive = soft-delete (logical); permanent delete only from the archive view (funnel pattern)
- SNS posting is demo-only (no OAuth). Stats are randomly generated on post
- Image attachments are placeholders (`{ ph: true, label, ratio }`) — no file upload yet
- Design tokens locked to: gothic font / amber accent / flat cards / roomy density / paper (cream) background
