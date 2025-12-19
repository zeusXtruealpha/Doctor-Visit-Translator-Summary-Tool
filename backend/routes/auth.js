const express = require('express');
const authService = require('../services/auth');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

// Input validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        code: 'INVALID_PASSWORD'
      });
    }

    // Attempt login
    const result = await authService.login(email, password);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error || 'Invalid credentials',
        code: 'LOGIN_FAILED'
      });
    }

    // Return success with user data and session
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        created_at: result.user.created_at,
        last_sign_in_at: result.user.last_sign_in_at
      },
      session: {
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
        expires_at: result.session.expires_at
      }
    });

  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        code: 'INVALID_PASSWORD'
      });
    }

    // Attempt registration
    const result = await authService.register(email, password);

    if (!result.success) {
      // Handle specific Supabase errors
      if (result.error.includes('already registered')) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
        });
      }

      return res.status(400).json({
        success: false,
        error: result.error || 'Registration failed',
        code: 'REGISTRATION_FAILED'
      });
    }

    // Return success with user data and session
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        created_at: result.user.created_at,
        last_sign_in_at: result.user.last_sign_in_at
      },
      session: result.session ? {
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
        expires_at: result.session.expires_at
      } : null
    });

  } catch (error) {
    console.error('Registration endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    // Logout doesn't require authentication in Supabase
    // The client will handle clearing local session
    const result = await authService.logout();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Logout failed',
        code: 'LOGOUT_FAILED'
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during logout',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/auth/user - Get user profile (requires authentication)
router.get('/user', authenticateUser, async (req, res) => {
  try {
    // User data is already available from the authentication middleware
    const user = req.user;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }
    });

  } catch (error) {
    console.error('User profile endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error retrieving user profile',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;