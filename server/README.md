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

| Method | Path               | Body                            | Returns               |
| ------ | ------------------ | ------------------------------- | --------------------- |
| POST   | `/api/auth/signup` | `{ username, email, password }` | `201 { user, token }` |
| POST   | `/api/auth/login`  | `{ usernameOrEmail, password }` | `200 { user, token }` |
| POST   | `/api/auth/demo`   |                                 | `201 { user, token }` |

Usernames are 3-20 characters (letters, numbers, `.`, `-`, `_`) and unique
regardless of case. Passwords are 8-72 characters.

`/api/auth/demo` creates a fresh account (`isDemo: true`) holding a sample
trade history priced from real market data. Every visitor gets their own, so
nobody can spoil it for the next person; demo accounts are deleted after 24
hours.

### Account

| Method | Path      | Body                    | Returns                                      |
| ------ | --------- | ----------------------- | -------------------------------------------- |
| GET    | `/api/me` |                         | `{ id, username, email, isDemo, createdAt }` |
| PATCH  | `/api/me` | `{ username?, email? }` | the updated user                             |
| DELETE | `/api/me` |                         | `204`; also deletes their transactions       |

### Transactions

| Method | Path                    | Notes                                                           |
| ------ | ----------------------- | --------------------------------------------------------------- |
| GET    | `/api/transactions`     | Newest first. Optional `?type=buy\|sell&assetId=1`              |
| POST   | `/api/transactions`     | `{ ticker, type, quantity, price?, executedAt?, note? }` -> 201 |
| PATCH  | `/api/transactions/:id` | Any of `{ type, quantity, price, executedAt, note }`            |
| DELETE | `/api/transactions/:id` | `204`                                                           |

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

- `ticker` must be an asset the market lists; the server supplies its name.
- `executedAt` defaults to now and may be any past date, so old trades can be
  backfilled. `price` defaults to the market price on that date.
- The ledger must make sense at every point in time. A sell, an edit or a
  delete is rejected with `400` if it would leave the balance negative on any
  date - including a backdated sell that an existing later sell depends on.
- Writes run inside a database transaction that locks the user's row, so two
  simultaneous sells cannot oversell a holding.

### Portfolio

| Method | Path                             | Notes                                           |
| ------ | -------------------------------- | ----------------------------------------------- |
| GET    | `/api/portfolio`                 | Holdings, valuations and totals                 |
| GET    | `/api/portfolio/history`         | Daily value. `?range=30d\|90d\|1y` (default 90d) |
| DELETE | `/api/portfolio/assets/:assetId` | Removes the asset and its transactions          |

```json
{
  "holdings": [
    {
      "asset": { "id": 1, "ticker": "BTC", "name": "Bitcoin" },
      "quantity": "2",
      "averageCost": 30000,
      "costBasis": 60000,
      "realizedPnl": 0,
      "price": 60000,
      "change24h": 2.5,
      "value": 120000,
      "unrealizedPnl": 60000,
      "unrealizedPnlPercent": 100,
      "allocation": 100
    }
  ],
  "totals": {
    "value": 120000,
    "costBasis": 60000,
    "unrealizedPnl": 60000,
    "unrealizedPnlPercent": 100,
    "realizedPnl": 0,
    "change24h": 2926.83,
    "change24hPercent": 2.5
  },
  "unpriced": [],
  "pricedAt": "2026-03-05T12:00:00.000Z"
}
```

Nothing here is stored. Holdings are replayed from the caller's transactions
with the average-cost method: a buy adds to the cost basis, a sell removes
cost in proportion and books the difference as realised profit. They cannot
drift out of step with the history.

A holding with no available price has `null` money fields and is named in
`unpriced` rather than being counted as zero. If the price source is down the
endpoint still answers, with every holding unpriced.

`/history` returns `{ range, points: [{ date, value, costBasis }] }`, rebuilt
from the ledger and daily closing prices; the last point uses the live price.

### Market data

| Method | Path                               | Notes                                          |
| ------ | ---------------------------------- | ---------------------------------------------- |
| GET    | `/api/market/assets`               | `?q=bit&limit=10` -> `[{ ticker, name, price, change24h }]` |
| GET    | `/api/market/assets/:ticker/price` | Live price, or a day's close with `?date=2026-03-05` |

Prices come from Coinbase's public API through one small interface
(`src/modules/market/provider.ts`). Responses are cached in memory (quotes for
30 seconds, the asset list for 6 hours, daily closes for an hour), concurrent
callers share one upstream request, and the last good answer keeps being
served if a refresh fails. Set `MARKET_DATA=static` for fixed, offline prices:
the end-to-end tests do, so their numbers never change.
