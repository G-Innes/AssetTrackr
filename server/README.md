# AssetTrackr Portfolio Manager

AssetTrackr is a portfolio manager that allows users to manage their asset portfolios. The current MVP version provides basic functionality for user authentication, profile creation, and adding assets to a user's portfolio.

## Overview

The primary features of AssetTrackr include:

- User signup and login
- Managing user profiles
- Adding assets to a user's portfolio
- Updating portfolio holdings
- Viewing portfolio holdings
- Recording transactions (buying or selling assets)

The application is currently in active development, with a focus on backend functionality for portfolio management.

Future enhancements will include performance tracking of individual holdings and overall portfolio, providing users with insights into their investment performance over time.

## Getting Started

Follow these steps to set up the project locally:

1. Clone the repository
2. Run `npm install` in the root directory
3. Navigate to the server directory with `cd server`
4. Run `npm install` again in the server directory
5. Create two Postgres databases: `AssetTracker` and `Test_AssetTracker`
6. Start the server with `npm start`

## API Usage

You can interact with the API using tools like Insomnia or Postman. Here are some example requests:

- Signup: `POST http://localhost:3000/user` with JSON body:
```json
  {
    "username": "VeryFirstUser",
    "email": "firstuser@gmail.com",
    "password": "Password123"
  }
```

- Login: `POST http://localhost:3000/user/login` with JSON body:
```json
  {
    "usernameOrEmail": "VeryFirstUser",
    "password": "Password123"
  }
```

- User Profile: `GET http://localhost:3000/user/user/1`

- Update User: `PUT http://localhost:3000/user/user/2` with JSON body:
```json
  {
    "username": "VeryFirstUser(UPDATED)",
    "email": "Updatedfirstuser@gmail.com"
  }
```

- Delete User: `DELETE http://localhost:3000/user/user/1`

# Testing
Tests interact with the Test_AssetTracker database and should be run in isolation:

`npm test src/modules/assets/userController.spec.ts`

`npm test src/modules/assets/userAuth.spec.ts`

`npm test src/modules/assets/userProfile.spec.ts`