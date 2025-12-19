const authService = require('../services/auth');

// Middleware to verify JWT token and extract user
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Validate token format (basic check)
    if (!token || token.length < 10) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token format.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }
    
    const result = await authService.getUserFromToken(token);
    
    if (!result.success) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token.',
        code: 'TOKEN_VALIDATION_FAILED'
      });
    }

    // Ensure user exists and is active
    if (!result.user || !result.user.id) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found or inactive.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user to request object with additional metadata
    req.user = {
      id: result.user.id,
      email: result.user.email,
      created_at: result.user.created_at,
      last_sign_in_at: result.user.last_sign_in_at
    };
    
    // Add request timestamp for logging
    req.authTimestamp = new Date().toISOString();
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication service temporarily unavailable.',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Basic token format validation
      if (token && token.length >= 10) {
        const result = await authService.getUserFromToken(token);
        
        if (result.success && result.user && result.user.id) {
          req.user = {
            id: result.user.id,
            email: result.user.email,
            created_at: result.user.created_at,
            last_sign_in_at: result.user.last_sign_in_at
          };
          req.isAuthenticated = true;
        } else {
          req.isAuthenticated = false;
        }
      } else {
        req.isAuthenticated = false;
      }
    } else {
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.isAuthenticated = false;
    next(); // Continue without authentication
  }
};

// Middleware to check if user owns a resource (for user-specific data)
const requireOwnership = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    // This will be used in routes where we check resource ownership
    // The actual ownership check will be done in the route handler
    req.resourceUserIdField = resourceUserIdField;
    next();
  };
};

// Middleware to validate user session freshness (optional security enhancement)
const requireFreshSession = (maxAgeHours = 24) => {
  return (req, res, next) => {
    if (!req.user || !req.user.last_sign_in_at) {
      return res.status(401).json({
        success: false,
        error: 'Fresh authentication required.',
        code: 'FRESH_AUTH_REQUIRED'
      });
    }

    const lastSignIn = new Date(req.user.last_sign_in_at);
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
    const now = new Date();

    if (now - lastSignIn > maxAge) {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.',
        code: 'SESSION_EXPIRED'
      });
    }

    next();
  };
};

module.exports = {
  authenticateUser,
  optionalAuth,
  requireOwnership,
  requireFreshSession
};