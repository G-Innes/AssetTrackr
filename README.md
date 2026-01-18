# AssetTrackr

A modern web application for managing cryptocurrency investments. Track buy/sell transactions, view live prices from Coinbase, and monitor your portfolio value in real-time.

**Live Demo:** [https://asset-trackr-client.vercel.app](https://asset-trackr-client.vercel.app)

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Features](#future-features)

## Features
- Log buy and sell transactions for crypto assets
- Fetch live prices using the Coinbase API
- Calculate and display total portfolio value
- User authentication with JWT
- Dashboard displaying all assets and current values
- View and filter transaction history
- Modern glassmorphism UI with smooth animations
- Responsive design for all devices

## Technologies Used

### Frontend
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** @vueuse/motion
- **State Management:** Pinia
- **Routing:** Vue Router

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** TypeORM
- **Language:** TypeScript
- **Authentication:** JWT + bcrypt

### Infrastructure
- **Database:** PostgreSQL (Neon)
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vue 3 SPA     │────▶│  Express API    │────▶│   PostgreSQL    │
│   (Vercel)      │     │   (Render)      │     │    (Neon)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │  Coinbase API   │
                        └─────────────────┘
```

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/G-Innes/AssetTrackr.git
    cd AssetTrackr
    ```

2. **Install dependencies:**
    ```bash
    npm run install:all
    ```

3. **Set up environment variables:**

   Create `server/.env`:
    ```env
    DATABASE_URL=your_postgres_database_url
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    ```

4. **Run the application:**
    ```bash
    npm run dev
    ```

## Usage
- **Homepage:** Landing page with app overview
- **Signup/Login:** Create an account or authenticate
- **Dashboard:** View your assets and total portfolio value
- **Buy/Sell:** Add transactions to update your portfolio
- **Transactions:** View and filter your transaction history

## Development Workflow

This project uses several tools to ensure code quality:

- **Husky:** Git hooks for pre-commit validation
- **lint-staged:** Runs linters on staged files
- **ESLint:** Code quality standards
- **Prettier:** Consistent code formatting
- **TypeScript:** Static type checking
- **Commitlint:** Conventional commit messages

### Commands

```bash
# Run development servers (client + server)
npm run dev

# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck

# Build for production
npm run build
```

## Testing

**Backend Tests (Jest):**
```bash
cd server
npm run test
```

**Frontend Tests (Playwright):**
```bash
cd client
npm run test:e2e
```

## Deployment

### Frontend (Vercel)
- Automatically deploys from `main` branch
- Build command: `npm run build`
- Output directory: `client/dist`

### Backend (Render)
- Automatically deploys from `main` branch
- Build command: `npm install --include=dev && npm run build`
- Start command: `npm start`

### Environment Variables (Render)
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Set to `production`

## Future Features
- Performance tracking charts
- Portfolio allocation visualization
- Cryptocurrency news integration
- Price alerts and notifications
