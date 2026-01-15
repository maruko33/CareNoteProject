# LedgerNote API Demo Script (Swagger + curl)

This file is an API-level walkthrough you can run live (without the UI).

## Assumptions

- Base URL: `http://127.0.0.1:8000`
- Swagger UI: `GET /docs`
- Key routes:
  - `/auth/*`
  - `/api/v1/accounts/*`
  - `/api/v1/journal_entry/*`
  - `/api/v1/reports/*`

---

## Option A: Swagger Demo (Recommended)

1) Open Swagger  
`http://127.0.0.1:8000/docs`

2) Register  
`POST /auth/register` (JSON)

Example body:
```json
{
  "email": "demo@example.com",
  "password": "DemoPassword123!"
}
```

3) Login and copy the token (OAuth2 password flow)  
`POST /auth/login` (application/x-www-form-urlencoded)

Fill:
- `grant_type`: `password`
- `username`: `demo@example.com`
- `password`: `DemoPassword123!`

Response:
```json
{ "access_token": "...", "token_type": "bearer" }
```

4) Click **Authorize** in Swagger  
Paste: `Bearer <access_token>`

5) Create two accounts  
`POST /api/v1/accounts/` (twice)

Example: Saving
```json
{ "name": "Saving", "type": "ASSET", "currency": "CAD" }
```

Example: Credit
```json
{ "name": "Credit", "type": "EXPENSE", "currency": "CAD" }
```

6) Create a balanced journal entry  
`POST /api/v1/journal_entry/`

Example (replace account ids):
```json
{
  "occurred_at": "2026-01-11T12:00:00Z",
  "description": "Demo: income received",
  "postings": [
    { "ledger_account_id": 1, "amount_minor": 10000, "currency": "CAD", "memo": "debit" },
    { "ledger_account_id": 2, "amount_minor": -10000, "currency": "CAD", "memo": "credit" }
  ]
}
```

Notes:
- Amounts are stored as integer minor units.
- `sum(amount_minor) = 0` ensures double-entry balance.
- Entries are append-only (correction/reversal are new entries).

7) Trial balance (as-of)  
`GET /api/v1/reports/trial-balance?as_of=...`  
Try without `as_of` to use the backend default.

8) Reverse an entry (optional)  
`POST /api/v1/journal_entry/{id}/reverse`

9) Trial balance again (should net out)

10) Correct an entry (optional)  
`POST /api/v1/journal_entry/{id}/correct`

---

## Option B: curl Demo (Scripted)

This section mirrors the Swagger steps. Export a token, then call endpoints.

### 1) Register
```bash
curl -s -X POST "http://127.0.0.1:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"DemoPassword123!"}'
```

### 2) Login (form-urlencoded) and export token
```bash
TOKEN=$(
  curl -s -X POST "http://127.0.0.1:8000/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password&username=demo@example.com&password=DemoPassword123!" \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
)
echo "$TOKEN"
```

### 3) Create accounts
```bash
curl -s -X POST "http://127.0.0.1:8000/api/v1/accounts/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Saving","type":"ASSET","currency":"CAD"}'

curl -s -X POST "http://127.0.0.1:8000/api/v1/accounts/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Credit","type":"EXPENSE","currency":"CAD"}'
```

### 4) Create an entry (replace ids)
```bash
curl -s -X POST "http://127.0.0.1:8000/api/v1/journal_entry/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occurred_at":"2026-01-11T12:00:00Z",
    "description":"Demo: income received",
    "postings":[
      {"ledger_account_id":1,"amount_minor":10000,"currency":"CAD","memo":"debit"},
      {"ledger_account_id":2,"amount_minor":-10000,"currency":"CAD","memo":"credit"}
    ]
  }'
```

### 5) Trial balance
```bash
curl -s "http://127.0.0.1:8000/api/v1/reports/trial-balance" \
  -H "Authorization: Bearer $TOKEN"
```
