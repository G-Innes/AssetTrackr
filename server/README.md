# AssetTrackr Portfolio Manager

AssetTrackr is a portfolio manager that allows users to manage their asset portfolios. The current MVP version provides basic functionality for user authentication, profile creation, and adding assets to a user's portfolio.

## Overview

The primary features of AssetTrackr include:

- User signup and login
- Managing user profiles
- Adding assets to a user's portfolio
- Updating portfolio holdings
- Viewing portfolio holdings

The application is currently in active development, with a focus on backend functionality for portfolio management.

Future enhancements will include performance tracking of individual holdings and overall portfolio, providing users with insights into their investment performance over time.

## Getting Started

Follow these steps to set up the project locally:

1. Clone the repository
2. Run `npm install` in the root directory
3. Navigate to the server directory with `cd server`
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

- Create New User Asset: `POST http://localhost:3000/user/1/assets` with JSON body:
```json
  {
    "userId": 1,
    "assetId": 1,
    "quantity": 300,
    "name": "Some Asset Name",
    "ticker": "SAN",
    "current_price": 100
  }
```

- Get All User Assets: `GET http://localhost:3000/user/1/assets`

- Update User Asset: `http://localhost:3000/user/1/assets/1` with JSON body:
```json
  {
    "userId": 1,
    "assetId": 1,
    "quantity": 500,
    "name": "Some Updated Asset name",
    "ticker": "SUAN",
    "current_price": 250
  }
  ```

- Delete User Asset: `DELETE http://localhost:3000/user/1/assets/1`

# Testing
Tests interact with the Test_AssetTracker database and should be run in isolation:

`npm test src/modules/assets/userController.spec.ts`

`npm test src/modules/assets/userAuth.spec.ts`

