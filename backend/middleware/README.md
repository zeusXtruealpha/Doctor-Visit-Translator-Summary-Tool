# Authentication Middleware

This directory contains authentication middleware for the Doctor Visit Translator API.

## Available Middleware

### `authenticateUser`
**Purpose**: Validates JWT tokens and ensures user authentication for protected routes.

**Usage**:
```javascript
const { authenticateUser } = require('../middleware/auth');
router.post('/protected-route', authenticateUser, (req, res) => {
  // req.user contains authenticated user data
  console.log(req.user.id, req.user.email);
});
```

**Response on failure**:
- `401` with error codes: `NO_TOKEN`, `INVALID_TOKEN_FORMAT`, `TOKEN_VALIDATION_FAILED`, `USER_NOT_FOUND`
- `500` with error code: `AUTH_SERVICE_ERROR`

**Sets on success**:
- `req.user`: User object with id, email, created_at, last_sign_in_at
- `req.authTimestamp`: ISO timestamp of authentication

### `optionalAuth`
**Purpose**: Attempts authentication but doesn't fail if no token is provided.

**Usage**:
```javascript
const { optionalAuth } = require('../middleware/auth');
router.get('/public-route', optionalAuth, (req, res) => {
  if (req.isAuthenticated) {
    // User is logged in
    console.log(req.user.id);
  } else {
    // Anonymous user
  }
});
```

**Sets always**:
- `req.isAuthenticated`: Boolean indicating if user is authenticated
- `req.user`: User object (if authenticated) or undefined

### `requireOwnership`
**Purpose**: Ensures user is authenticated and sets up ownership validation.

**Usage**:
```javascript
const { requireOwnership } = require('../middleware/auth');
router.get('/user-resource/:id', requireOwnership('user_id'), (req, res) => {
  // Use req.resourceUserIdField in your route logic to validate ownership
  // This middleware only ensures authentication - ownership check is done in route
});
```

**Parameters**:
- `resourceUserIdField` (optional): Field name to check for ownership (default: 'user_id')

### `requireFreshSession`
**Purpose**: Ensures user session is recent (within specified hours).

**Usage**:
```javascript
const { requireFreshSession } = require('../middleware/auth');
router.post('/sensitive-action', requireFreshSession(2), (req, res) => {
  // User must have logged in within last 2 hours
});
```

**Parameters**:
- `maxAgeHours` (optional): Maximum session age in hours (default: 24)

## Error Codes

| Code | Description |
|------|-------------|
| `NO_TOKEN` | No authorization header provided |
| `INVALID_TOKEN_FORMAT` | Token is too short or malformed |
| `TOKEN_VALIDATION_FAILED` | Token is invalid or expired |
| `USER_NOT_FOUND` | User associated with token not found |
| `AUTH_SERVICE_ERROR` | Authentication service unavailable |
| `AUTH_REQUIRED` | Authentication required for this resource |
| `FRESH_AUTH_REQUIRED` | Fresh authentication required |
| `SESSION_EXPIRED` | User session has expired |

## Integration with Supabase

The middleware integrates with Supabase Auth through the `authService.getUserFromToken()` method. Ensure your Supabase configuration is properly set up in `backend/config/supabase.js`.

## Testing

Run the authentication middleware tests:
```bash
npm test -- tests/middleware/auth.test.js
```

All middleware functions are thoroughly tested with unit tests covering success cases, error cases, and edge cases.