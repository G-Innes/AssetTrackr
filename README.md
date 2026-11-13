# AssetTrackr

A crypto portfolio tracker. Record your buys and sells and it works out what
you hold, what it cost, what it is worth now, and how much you have made or
lost, priced live from Coinbase.

**Live demo:** <https://asset-trackr-client.vercel.app> - press **Try the
demo** for a ready-made portfolio, no sign-up needed.

![The dashboard: total value with a chart of its history, profit figures, allocation and holdings](screenshots/dashboard.png)

| Record a trade                               | Transaction history                                  |
| -------------------------------------------- | ---------------------------------------------------- |
| ![Trade form](screenshots/trade.png)    | ![Transactions](screenshots/transactions.png)   |

## What it does

- **Portfolio at a glance** - total value, 24-hour change, a chart of value
  over 30 days, 90 days or a year, and how the portfolio is split.
- **Real profit and loss** - average-cost basis per holding, unrealised
  profit on what you still hold, realised profit on what you have sold.
- **A proper ledger** - trades can be backdated, edited and deleted. A
  backdated trade is priced from that day's market close unless you enter
  your own price.
- **Every asset Coinbase prices in USD** - searchable by name or ticker.
- **One-click demo** - each visitor gets a private sample account, deleted
  after 24 hours.
- **Accounts** - sign up, log in, change username, email and password, delete
  the account.

## How it is built

```
 Vue 3 SPA  ───────▶  Express API  ───────▶  PostgreSQL
 (client/)            (server/)
                          │
                          ▼
                    Coinbase public API
                    (cached, behind an interface)
```

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Client   | Vue 3 (`<script setup>`), TypeScript, Pinia, Vue Router, Tailwind CSS |
| API      | Node 22, Express, TypeORM, PostgreSQL, zod, JWT, bcrypt              |
| Tests    | Vitest + Supertest (API, against a real database), Vitest (client), Playwright (end to end) |
| Tooling  | npm workspaces, ESLint, Prettier, Husky, commitlint, GitHub Actions  |

### Decisions worth knowing about

**The transaction ledger is the only source of truth.** Holdings, cost basis
and profit are never stored; they are replayed from the user's transactions
on every request. There is no balance column to fall out of step with the
history, and editing or deleting an old trade simply changes the answer.

**The ledger has to make sense on every date.** Because trades can be
backdated and edited, checking "do you own enough to sell?" against today's
balance is not enough. Every write replays the asset's whole history and is
refused if the balance would go negative at any point - for example a
backdated sale that a later sale was relying on.

**Money is never a float.** Quantities and prices are `numeric(36,18)` in
Postgres, decimal strings over the wire and `decimal.js` values in the
arithmetic. `0.1 + 0.2` BTC is `0.3`.

**Concurrent sells cannot oversell.** Writes run in a database transaction
that takes a row lock on the user, so two simultaneous sells are checked one
after the other. There is a test that fires eight at once.

**Identity comes from the token, nowhere else.** No route takes a user id
from the URL or body, so one user cannot read or change another's data by
editing a request.

**Market data sits behind one interface.** The server, not the browser, talks
to Coinbase. Responses are cached, simultaneous callers share one upstream
request, and the last good answer is served if a refresh fails. If prices are
unavailable the portfolio still loads and says which holdings it could not
value, rather than showing them as $0. Tests swap in an in-memory provider.

**Charts are hand-written SVG.** Two charts did not justify a charting
library. They have keyboard and hover read-outs, and a colour palette checked
for colour-blind separation.

More detail, and the full API reference, is in [server/README.md](server/README.md).

### Known limits

- Cost basis uses the average-cost method only (no FIFO/LIFO or tax lots).
- Everything is in US dollars.
- Fees and transfers between wallets are not modelled.
- Sessions are stateless JWTs kept in `localStorage`: simple, but a token
  stays valid until it expires (one day), even after a password change.
- Historical charts use daily closing prices, so intraday moves are not shown.

## Running it locally

You need Node 22 and a PostgreSQL server.

```bash
git clone https://github.com/G-Innes/AssetTrackr.git
cd AssetTrackr
npm install

cp server/.env.example server/.env   # then set DATABASE_URL
npm run dev
```

The client is at <http://localhost:5173> and proxies `/api` to the server on
port 3000. The server creates and migrates its own tables on start.

The minimum `server/.env`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/assettrackr
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/assettrackr_test
```

Set `MARKET_DATA=static` to use fixed prices and work offline.

## Tests and checks

```bash
npm test            # API tests (needs TEST_DATABASE_URL) and client unit tests
npm run lint
npm run typecheck
npm run build

# End to end: start the app with fixed prices, then run Playwright
MARKET_DATA=static npm run dev
npm run test:e2e
```

The API tests run against a real Postgres database, which is wiped on every
run - point `TEST_DATABASE_URL` at one you do not mind losing. CI runs all of
the above on every push and pull request.

## Deployment

The client is a static build (`npm run build -w client`, output in
`client/dist`) hosted on Vercel. The API runs anywhere Node does:

```bash
npm install --include=dev && npm run build -w server
npm start            # applies database migrations, then serves
```

| Variable        |                                                              |
| --------------- | ------------------------------------------------------------ |
| `NODE_ENV`      | `production`                                                 |
| `DATABASE_URL`  | Postgres connection string                                   |
| `JWT_SECRET`    | Required in production, at least 32 random characters        |
| `CLIENT_ORIGIN` | The deployed client's origin(s), comma separated, for CORS   |
| `DATABASE_SSL`  | Defaults to `true` in production; set `false` for local Postgres |

The client needs `VITE_API_URL` set to the API's address at build time.
