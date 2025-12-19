const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
// New API key restart

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Doctor Visit Translator API is running',
    timestamp: new Date().toISOString()
  });
});



// Database connection test endpoint
app.get('/api/db-test', async (req, res) => {
  const dbService = require('./services/database');
  const result = await dbService.testConnection();
  
  if (result.success) {
    res.json({ 
      status: 'OK', 
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: result.error
    });
  }
});

// Gemini API test endpoint
app.get('/api/gemini-test', async (req, res) => {
  const geminiService = require('./services/gemini');
  const result = await geminiService.testConnection();
  
  if (result.success) {
    res.json({ 
      status: 'OK', 
      message: result.message,
      response: result.response,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Gemini API connection failed',
      error: result.error,
      availableModels: result.availableModels
    });
  }
});

// Translation test endpoint (no auth required)
app.post('/api/translate-test', async (req, res) => {
  const geminiService = require('./services/gemini');
  const { medicalText, targetLanguage } = req.body;
  
  if (!medicalText) {
    return res.status(400).json({ 
      status: 'ERROR', 
      message: 'medicalText is required' 
    });
  }
  
  const result = await geminiService.translateMedicalText(
    medicalText, 
    targetLanguage || 'english'
  );
  
  if (result.success) {
    res.json({ 
      status: 'OK', 
      data: result.data,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Translation failed',
      error: result.error
    });
  }
});

// List available Gemini models
app.get('/api/gemini-models', async (req, res) => {
  const geminiService = require('./services/gemini');
  const result = await geminiService.listAvailableModels();
  
  if (result.success) {
    res.json({ 
      status: 'OK', 
      models: result.models,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Failed to list models',
      error: result.error
    });
  }
});

// API routes will be added here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/translate', require('./routes/translate'));
app.use('/api/history', require('./routes/history'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});