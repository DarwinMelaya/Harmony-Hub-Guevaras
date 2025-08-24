# Backend Setup Guide

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/harmony_hub

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server Port
PORT=5000
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set up OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

## Running the Backend

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start
```

## API Endpoints

### User Registration

- **POST** `/api/users/register`
- Creates a new user with "client" role by default

### User Login

- **POST** `/api/users/login`

### Google OAuth

- **GET** `/auth/google` - Initiates Google OAuth
- **GET** `/auth/google/callback` - Google OAuth callback

## Features

- ✅ User registration with automatic "client" role assignment
- ✅ Google OAuth integration
- ✅ JWT token authentication
- ✅ CORS enabled for frontend integration
- ✅ Password hashing with bcrypt
- ✅ Form validation and error handling
