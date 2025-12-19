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

// Mock the database service
jest.mock('../../services/database');

// Mock the auth middleware
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    // Mock successful authentication
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com'
    };
    next();
  }
}));

const historyRoutes = require('../../routes/history');
const databaseService = require('../../services/database');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/history', historyRoutes);

describe('History Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/history', () => {
    it('should return user translation history successfully', async () => {
      const mockTranslations = [
        {
          id: 'translation-1',
          created_at: '2024-01-02T10:00:00Z',
          original_text: 'Take 2 tablets of paracetamol twice daily for fever and headache symptoms',
          target_language: 'english',
          condition: 'Fever and headache',
          medicines: 'Paracetamol 2 tablets twice daily'
        },
        {
          id: 'translation-2', 
          created_at: '2024-01-01T09:00:00Z',
          original_text: 'Apply ice pack to reduce swelling',
          target_language: 'tamil',
          condition: 'Swelling',
          medicines: 'Ice pack application'
        }
      ];

      databaseService.getUserTranslations.mockResolvedValue({
        success: true,
        data: mockTranslations
      });

      const response = await request(app)
        .get('/api/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      
      // Check that most recent is first (chronological order)
      expect(response.body.data[0].id).toBe('translation-1');
      expect(response.body.data[1].id).toBe('translation-2');
      
      // Check preview is truncated
      expect(response.body.data[0].preview).toBe('Take 2 tablets of paracetamol twice daily for fever and headache symptoms');
      expect(response.body.data[1].preview).toBe('Apply ice pack to reduce swelling');
      
      // Check pagination info
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(50);
      expect(response.body.pagination.offset).toBe(0);

      expect(databaseService.getUserTranslations).toHaveBeenCalledWith('test-user-id', 50, 0);
    });

    it('should handle pagination parameters', async () => {
      databaseService.getUserTranslations.mockResolvedValue({
        success: true,
        data: []
      });

      const response = await request(app)
        .get('/api/history?limit=10&offset=20');

      expect(response.status).toBe(200);
      expect(databaseService.getUserTranslations).toHaveBeenCalledWith('test-user-id', 10, 20);
    });

    it('should reject invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/history?limit=200&offset=-1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid query parameters');
    });

    it('should handle database errors', async () => {
      databaseService.getUserTranslations.mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      });

      const response = await request(app)
        .get('/api/history');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to retrieve translation history');
    });
  });

  describe('GET /api/history/:id', () => {
    it('should return specific translation successfully', async () => {
      const mockTranslation = {
        id: 'translation-123',
        created_at: '2024-01-01T10:00:00Z',
        original_text: 'Take medicine as prescribed',
        target_language: 'english',
        condition: 'Common cold',
        medicines: 'Paracetamol',
        daily_routine: 'Take with food',
        dos: 'Rest well',
        donts: 'Avoid alcohol'
      };

      databaseService.getTranslationById.mockResolvedValue({
        success: true,
        data: mockTranslation
      });

      const response = await request(app)
        .get('/api/history/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('translation-123');
      expect(response.body.data.originalText).toBe('Take medicine as prescribed');
      expect(response.body.data.condition).toBe('Common cold');
      expect(response.body.data.dailyRoutine).toBe('Take with food');

      expect(databaseService.getTranslationById).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'test-user-id'
      );
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/history/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid translation ID');
    });

    it('should return 404 for non-existent translation', async () => {
      databaseService.getTranslationById.mockResolvedValue({
        success: false,
        error: 'Translation not found'
      });

      const response = await request(app)
        .get('/api/history/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Translation not found or access denied');
    });

    it('should handle database errors', async () => {
      databaseService.getTranslationById.mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      });

      const response = await request(app)
        .get('/api/history/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to retrieve translation');
    });
  });
});