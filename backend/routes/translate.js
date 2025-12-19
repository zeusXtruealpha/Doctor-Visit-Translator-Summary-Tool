const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const router = express.Router();
const geminiService = require('../services/gemini');
const databaseService = require('../services/database');
const { authenticateUser } = require('../middleware/auth');

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation middleware for translation request
const validateTranslationRequest = [
  body('medicalText')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Medical text must be between 10 and 5000 characters'),
  body('targetLanguage')
    .isIn(['english', 'tamil', 'hindi'])
    .withMessage('Target language must be english, tamil, or hindi')
];

// POST /api/translate/test - Test translation without authentication (for development)
router.post('/test', validateTranslationRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { medicalText, targetLanguage } = req.body;

    // Translate using Gemini API
    const translationResult = await geminiService.translateMedicalText(
      medicalText, 
      targetLanguage
    );

    if (!translationResult.success) {
      return res.status(500).json({
        success: false,
        error: translationResult.error
      });
    }

    res.json({
      success: true,
      data: translationResult.data,

    });

  } catch (error) {
    console.error('Test translation endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation service temporarily unavailable'
    });
  }
});

// POST /api/translate/image - Translate medical image
router.post('/image', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    const { targetLanguage = 'english' } = req.body;
    
    if (!['english', 'tamil', 'hindi'].includes(targetLanguage)) {
      return res.status(400).json({
        success: false,
        error: 'Target language must be english, tamil, or hindi'
      });
    }

    const userId = req.user.id;

    // Translate using Gemini Vision API
    const translationResult = await geminiService.translateMedicalImage(
      req.file.buffer,
      req.file.mimetype,
      targetLanguage
    );

    if (!translationResult.success) {
      return res.status(500).json({
        success: false,
        error: translationResult.error
      });
    }

    // Save translation to database
    const saveResult = await databaseService.createTranslation(
      userId, 
      translationResult.data
    );

    if (!saveResult.success) {
      console.error('Failed to save translation:', saveResult.error);
    }

    res.json({
      success: true,
      data: {
        id: saveResult.success ? saveResult.data.id : null,
        ...translationResult.data,
        savedToHistory: saveResult.success
      }
    });

  } catch (error) {
    console.error('Image translation endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Image processing service temporarily unavailable'
    });
  }
});

// POST /api/translate - Translate medical text
router.post('/', authenticateUser, validateTranslationRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { medicalText, targetLanguage } = req.body;
    const userId = req.user.id;

    // Translate using Gemini API
    const translationResult = await geminiService.translateMedicalText(
      medicalText, 
      targetLanguage
    );

    if (!translationResult.success) {
      return res.status(500).json({
        success: false,
        error: translationResult.error
      });
    }

    // Save translation to database
    const saveResult = await databaseService.createTranslation(
      userId, 
      translationResult.data
    );

    if (!saveResult.success) {
      console.error('Failed to save translation:', saveResult.error);
      // Still return the translation even if saving fails
    }

    res.json({
      success: true,
      data: {
        id: saveResult.success ? saveResult.data.id : null,
        ...translationResult.data,
        savedToHistory: saveResult.success
      }
    });

  } catch (error) {
    console.error('Translation endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation service temporarily unavailable'
    });
  }
});

module.exports = router;