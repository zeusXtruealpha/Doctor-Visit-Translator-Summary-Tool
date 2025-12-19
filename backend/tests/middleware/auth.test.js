const { authenticateUser, optionalAuth, requireOwnership, requireFreshSession } = require('../../middleware/auth');

// Mock the auth service
jest.mock('../../services/auth', () => ({
  getUserFromToken: jest.fn()
}));

const authService = require('../../services/auth');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should reject requests without authorization header', async () => {
      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid authorization header format', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with short tokens', async () => {
      req.headers.authorization = 'Bearer abc';

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token format.',
        code: 'INVALID_TOKEN_FORMAT'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid tokens', async () => {
      req.headers.authorization = 'Bearer validlengthtoken123';
      authService.getUserFromToken.mockResolvedValue({
        success: false,
        error: 'Invalid token'
      });

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token.',
        code: 'TOKEN_VALIDATION_FAILED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept valid tokens and set user data', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        last_sign_in_at: '2023-01-01T12:00:00Z'
      };

      req.headers.authorization = 'Bearer validlengthtoken123';
      authService.getUserFromToken.mockResolvedValue({
        success: true,
        user: mockUser
      });

      await authenticateUser(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(req.authTimestamp).toBeDefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      req.headers.authorization = 'Bearer validlengthtoken123';
      authService.getUserFromToken.mockRejectedValue(new Error('Service error'));

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication service temporarily unavailable.',
        code: 'AUTH_SERVICE_ERROR'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should continue without authentication when no token provided', async () => {
      await optionalAuth(req, res, next);

      expect(req.isAuthenticated).toBe(false);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should set user data when valid token provided', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        last_sign_in_at: '2023-01-01T12:00:00Z'
      };

      req.headers.authorization = 'Bearer validlengthtoken123';
      authService.getUserFromToken.mockResolvedValue({
        success: true,
        user: mockUser
      });

      await optionalAuth(req, res, next);

      expect(req.isAuthenticated).toBe(true);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should continue without authentication when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken123';
      authService.getUserFromToken.mockResolvedValue({
        success: false,
        error: 'Invalid token'
      });

      await optionalAuth(req, res, next);

      expect(req.isAuthenticated).toBe(false);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireOwnership', () => {
    it('should require authentication', () => {
      const middleware = requireOwnership();
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should set resource field when user is authenticated', () => {
      req.user = { id: 'user123' };
      const middleware = requireOwnership('custom_user_id');
      
      middleware(req, res, next);

      expect(req.resourceUserIdField).toBe('custom_user_id');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireFreshSession', () => {
    it('should require authentication', () => {
      const middleware = requireFreshSession();
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Fresh authentication required.',
        code: 'FRESH_AUTH_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired sessions', () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25); // 25 hours ago
      
      req.user = {
        id: 'user123',
        last_sign_in_at: oldDate.toISOString()
      };
      
      const middleware = requireFreshSession(24); // 24 hour limit
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Session expired. Please log in again.',
        code: 'SESSION_EXPIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept fresh sessions', () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 1); // 1 hour ago
      
      req.user = {
        id: 'user123',
        last_sign_in_at: recentDate.toISOString()
      };
      
      const middleware = requireFreshSession(24); // 24 hour limit
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});