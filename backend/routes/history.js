const express = require('express');
const { query, param, validationResult } = require('express-validator');
const router = express.Router();
const databaseService = require('../services/database');
const { authenticateUser } = require('../middleware/auth');

// GET /api/history - Get user's translation history with pagination
router.get('/', 
  authenticateUser,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
      .toInt()
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const limit = req.query.limit || 50; // Default to 50 items
      const offset = req.query.offset || 0; // Default to start from beginning

      // Get user's translation history
      const result = await databaseService.getUserTranslations(userId, limit, offset);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve translation history'
        });
      }

      // Transform the data to include preview and format for frontend
      const transformedHistory = result.data.map(translation => ({
        id: translation.id,
        date: translation.created_at,
        preview: translation.original_text.substring(0, 100) + 
                (translation.original_text.length > 100 ? '...' : ''),
        language: translation.target_language,
        originalText: translation.original_text,
        // Include basic translation info for quick access
        condition: translation.condition,
        medicines: translation.medicines
      }));

      // Sort chronologically (most recent first)
      transformedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

      res.json({
        success: true,
        data: transformedHistory,
        pagination: {
          limit,
          offset,
          total: transformedHistory.length,
          hasMore: transformedHistory.length === limit // Indicates if there might be more
        }
      });

    } catch (error) {
      console.error('History list endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error retrieving history'
      });
    }
  }
);

// GET /api/history/:id - Get specific translation by ID
router.get('/:id',
  authenticateUser,
  [
    param('id')
      .isUUID()
      .withMessage('Translation ID must be a valid UUID')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid translation ID',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const translationId = req.params.id;

      // Get specific translation (ensures user can only access their own)
      const result = await databaseService.getTranslationById(translationId, userId);

      if (!result.success) {
        if (result.error.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: 'Translation not found or access denied'
          });
        }
        
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve translation'
        });
      }

      // Return full structured translation data
      const translation = result.data;
      res.json({
        success: true,
        data: {
          id: translation.id,
          date: translation.created_at,
          originalText: translation.original_text,
          targetLanguage: translation.target_language,
          condition: translation.condition,
          medicines: translation.medicines,
          dailyRoutine: translation.daily_routine,
          dos: translation.dos,
          donts: translation.donts
        }
      });

    } catch (error) {
      console.error('History detail endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error retrieving translation'
      });
    }
  }
);

module.exports = router;