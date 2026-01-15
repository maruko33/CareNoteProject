# LedgerNote Runbook (Local Demo)

This document is a practical “how to run and demo” guide for LedgerNote.
For the project overview, design rules (append-only ledger, reversal/correction), and data model, see `README.md`.

## Prerequisites

- Node.js (recommended: latest LTS)
- Python 3.12+
- MySQL (Docker or local instance)

## Start the Backend (FastAPI)

From the backend directory:

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

Verify backend health:

```bash
curl http://localhost:8000/health
```

Swagger UI:

- http://localhost:8000/docs

## Start the Frontend (React / Vite)

From the frontend directory:

```bash
cd frontend/ledger-note-web
npm install
npm run dev
```

Open:

- http://localhost:5173

## End-to-End Demo (UI)

### Step 1 — Register

1. Open: `http://localhost:5173/register`
2. Create a user with email and password.
3. After registration completes, continue to Login.

Backend endpoint (reference):

- `POST /auth/register` (JSON: `{"email": "...", "password": "..."}`)

### Step 2 — Login (OAuth2 Password Flow)

1. Open: `http://localhost:5173/login`
2. Log in using the same credentials.
3. After login, you should be redirected to `Accounts`.

Backend endpoint (reference):

- `POST /auth/login` (`application/x-www-form-urlencoded`: `username`, `password`)
- Response: `{"access_token": "...", "token_type": "bearer"}`

### Step 3 — Create Accounts

1. Open: `Accounts`
2. Create two accounts (example):

- Account A: `Saving` (Type: `ASSET`, Currency: `CAD`)
- Account B: `Credit` (Type: `EXPENSE`, Currency: `CAD`)

Backend endpoints (reference):

- `GET /api/v1/accounts/`
- `POST /api/v1/accounts/`

### Step 4 — Create a Journal Entry (Double-Entry)

1. Open: `Entries` → `New Entry`
2. Select:
   - Debit Account: `Saving`
   - Credit Account: `Credit`
3. Amount (minor units): `100` (represents 1.00 in major units)
4. Submit.

Expected results:

- A journal entry is created with two postings.
- The entry is balanced (sum of `amount_minor` across postings equals 0).

Backend endpoints (reference):

- `GET /api/v1/journal_entry/`
- `POST /api/v1/journal_entry/`

### Step 5 — Trial Balance

1. Open: `Trial Balance`
2. Confirm:
   - The two accounts reflect the entry (one positive, one negative).
   - Balances sum to zero across all accounts in the same currency.

Backend endpoint (reference):

- `GET /api/v1/reports/trial-balance?as_of=...`

## Common Issues

### Blank page or routing problems
- Ensure you are running `npm run dev` inside `frontend/ledger-note-web` (where `package.json` lives).

### 401 Unauthorized on protected endpoints
- You are logged out or your token is missing/expired. Log in again.
- Ensure the client attaches `Authorization: Bearer <access_token>` for protected requests.

### 422 Validation Error on login
- The login endpoint requires `application/x-www-form-urlencoded` with `username` and `password`.
  Sending JSON will fail validation.

## Notes

- Amounts are stored as integer minor units (e.g., cents) to avoid floating-point rounding issues.
- The UI demo flow is designed to be quick for interviews and portfolio review.
