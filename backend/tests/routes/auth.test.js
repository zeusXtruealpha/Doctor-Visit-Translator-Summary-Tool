const request = require('supertest');
const express = require('express');

// Mock Supabase config before importing anything else
jest.mock('../../config/supabase', () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    refreshSession: jest.fn()
  }
}));

// Mock the auth service
jest.mock('../../services/auth');

const authRoutes = require('../../routes/auth');
const authService = require('../../services/auth');

// Mock the auth middleware
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    // Mock successful authentication
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: '2024-01-01T00:00:00Z'
    };
    next();
  }
}));

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResult = {
        success: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          last_sign_in_at: '2024-01-01T00:00:00Z'
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: 1234567890
        }
      };

      authService.login.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.session.access_token).toBe('mock-access-token');
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_EMAIL');
    });

    it('should reject login with short password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PASSWORD');
    });

    it('should handle login failure from auth service', async () => {
      authService.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('LOGIN_FAILED');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register successfully with valid data', async () => {
      const mockResult = {
        success: true,
        user: {
          id: 'new-user-id',
          email: 'newuser@example.com',
          created_at: '2024-01-01T00:00:00Z',
          last_sign_in_at: '2024-01-01T00:00:00Z'
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: 1234567890
        }
      };

      authService.register.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(authService.register).toHaveBeenCalledWith('newuser@example.com', 'password123');
    });

    it('should reject registration with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });

    it('should handle user already exists error', async () => {
      authService.register.mockResolvedValue({
        success: false,
        error: 'User already registered'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('USER_EXISTS');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      authService.logout.mockResolvedValue({
        success: true
      });

      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should handle logout failure', async () => {
      authService.logout.mockResolvedValue({
        success: false,
        error: 'Logout failed'
      });

      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('LOGOUT_FAILED');
    });
  });

  describe('GET /api/auth/user', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/user');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.id).toBe('test-user-id');
      expect(response.body.user.email).toBe('test@example.com');
    });
  });
});