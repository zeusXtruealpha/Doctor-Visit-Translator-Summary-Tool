# Authentication API Endpoints

This document describes the authentication API endpoints implemented for the Doctor Visit Translator application.

## Endpoints

### POST /api/auth/login
Authenticates a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "last_sign_in_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1234567890
  }
}
```

**Error Responses:**
- 400: Missing credentials, invalid email format, or password too short
- 401: Invalid credentials
- 500: Server error

### POST /api/auth/register
Registers a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "last_sign_in_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1234567890
  }
}
```

**Error Responses:**
- 400: Missing credentials, invalid email format, or password too short
- 409: User already exists
- 500: Server error

### POST /api/auth/logout
Logs out the current user session.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses:**
- 400: Logout failed
- 500: Server error

### GET /api/auth/user
Retrieves the current user's profile information. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "last_sign_in_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- 401: No token provided, invalid token, or user not found
- 500: Server error

## Validation Rules

- **Email**: Must be a valid email format
- **Password**: Must be at least 6 characters long
- **Authentication**: GET /api/auth/user requires a valid Bearer token

## Error Codes

All error responses include a `code` field for programmatic error handling:

- `MISSING_CREDENTIALS`: Email or password not provided
- `INVALID_EMAIL`: Email format is invalid
- `INVALID_PASSWORD`: Password is too short
- `LOGIN_FAILED`: Authentication failed
- `USER_EXISTS`: User already registered with this email
- `REGISTRATION_FAILED`: Registration process failed
- `LOGOUT_FAILED`: Logout process failed
- `NO_TOKEN`: No authorization header provided
- `INVALID_TOKEN_FORMAT`: Token format is invalid
- `TOKEN_VALIDATION_FAILED`: Token validation failed
- `USER_NOT_FOUND`: User not found or inactive
- `AUTH_SERVICE_ERROR`: Authentication service error
- `SERVER_ERROR`: Internal server error