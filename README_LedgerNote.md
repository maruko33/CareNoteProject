# LedgerNote

LedgerNote is a small full-stack ledger application that demonstrates JWT-based authentication, a chart of accounts, double-entry journal entries (balanced postings), and trial balance reporting.

## Quick links

- UI demo (end-to-end): `RUNBOOK.md`
- API demo (Swagger + curl): `API_DEMO.md`
- Backend API docs (Swagger): `http://localhost:8000/docs`

## Features

- Authentication: register, login (OAuth2 password flow), current user
- Accounts: create and list ledger accounts
- Journal entries: create balanced entries with postings (double-entry)
- Reports: trial balance as-of a given timestamp

## Tech stack

- Backend: FastAPI, SQLAlchemy, MySQL
- Frontend: React (Vite), React Router, Axios

## Local setup

### 1) Backend

From the backend directory:

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

Health check:

```bash
curl http://localhost:8000/health
```

Swagger UI:

- `http://localhost:8000/docs`

### 2) Frontend

From the frontend directory:

```bash
cd frontend/ledger-note-web
npm install
npm run dev
```

Open:

- `http://localhost:5173`

## Configuration

The frontend reads the backend base URL from a Vite environment variable:

- `VITE_API_BASE`

Create a local env file at `frontend/ledger-note-web/.env`:

```env
VITE_API_BASE=http://localhost:8000
```

If `VITE_API_BASE` is not set, the frontend defaults to `http://localhost:8000`.

## Demo

For a UI-based end-to-end demo (Register → Login → Accounts → New Entry → Trial Balance), see:

- `RUNBOOK.md`

For an API-level walkthrough (Swagger + curl), see:

- `API_DEMO.md`

## Project structure (frontend)

```
frontend/ledger-note-web/
  src/
    api/          # axios client + domain API wrappers (auth, accounts, entries, reports)
    auth/         # AuthContext + route protection (RequireAuth)
    pages/        # Route-level pages (Login, Register, Accounts, Entries, NewEntry, TrialBalance)
    components/   # Reusable UI components
```

## Design notes

- Amounts are stored as integer minor units (e.g., cents) to avoid floating-point rounding issues.
- Journal entries are balanced by construction (`sum(amount_minor) = 0` across postings).
- Ledger behavior is append-only: adjustments are represented by new entries (reversal/correction), rather than mutating historical postings.
