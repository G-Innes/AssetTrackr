# AssetTrackr API

Express + TypeORM + PostgreSQL. See the [root README](../README.md) for the
whole project; this file is the API reference.

## Running

```bash
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
npm run dev               # watch mode on http://localhost:3000
npm test                  # needs TEST_DATABASE_URL; that database is wiped
npm run build && npm start
```

The schema is managed by migrations in `src/database/migrations`. They are
applied automatically when the server starts (or with `npm run migrate`).

## Conventions

- Every route except `/api/health` and `/api/auth/*` needs
  `Authorization: Bearer <token>`.
- The caller is identified by the token alone. No route accepts a user id.
- Quantities and prices are decimal **strings** (`"0.00012345"`), stored as
  `numeric(36,18)`. Requests may send them as strings or numbers.
- Errors are `{ "message": string, "details"?: [{ field, message }] }`.

| Status | Meaning                                              |
| ------ | ---------------------------------------------------- |
| 400    | Validation failed, or the trade is not possible      |
| 401    | Missing, invalid or expired token; wrong credentials |
| 404    | No such route or resource                            |
| 409    | Username or email already in use                     |
| 429    | Too many signup/login attempts from this address     |

## Endpoints

### Auth

| Method | Path               | Body                              | Returns                   |
| ------ | ------------------ | --------------------------------- | ------------------------- |
| POST   | `/api/auth/signup` | `{ username, email, password }`   | `201 { user, token }`     |
| POST   | `/api/auth/login`  | `{ usernameOrEmail, password }`   | `200 { user, token }`     |

Usernames are 3-20 characters (letters, numbers, `.`, `-`, `_`) and unique
regardless of case. Passwords are 8-72 characters.

### Account

| Method | Path      | Body                     | Returns                                |
| ------ | --------- | ------------------------ | -------------------------------------- |
| GET    | `/api/me` |                          | `{ id, username, email, createdAt }`   |
| PATCH  | `/api/me` | `{ username?, email? }`  | the updated user                       |
| DELETE | `/api/me` |                          | `204`; also deletes their transactions |

### Transactions

| Method | Path                | Notes                                               |
| ------ | ------------------- | --------------------------------------------------- |
| GET    | `/api/transactions` | Newest first. Optional `?type=buy\|sell&assetId=1`  |
| POST   | `/api/transactions` | `{ ticker, type, quantity, price, name? }` -> `201` |

```json
{
  "id": 12,
  "type": "buy",
  "quantity": "0.004",
  "price": "60000.55",
  "executedAt": "2026-03-05T12:00:00.000Z",
  "note": null,
  "asset": { "id": 1, "ticker": "BTC", "name": "Bitcoin" }
}
```

A sell is rejected with `400` if it exceeds the caller's balance. Trades are
written inside a database transaction that locks the user's row, so two
simultaneous sells cannot oversell a holding.

### Holdings

| Method | Path                     | Notes                                                   |
| ------ | ------------------------ | ------------------------------------------------------- |
| GET    | `/api/holdings`          | `[{ asset, quantity }]`, derived from the transactions  |
| DELETE | `/api/holdings/:assetId` | Removes the asset and its transactions from the account |

Holdings are never stored: they are the sum of the caller's buys minus sells
per asset, so they cannot drift out of step with the history.
