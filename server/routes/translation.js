const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/translation/translate
// @desc    Translate text using Google Translate API
// @access  Private
router.post('/translate', auth, [
  body('text')
    .notEmpty()
    .withMessage('Text to translate is required')
    .isLength({ max: 5000 })
    .withMessage('Text cannot exceed 5000 characters'),
  body('targetLanguage')
    .notEmpty()
    .withMessage('Target language is required')
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be 2-5 characters'),
  body('sourceLanguage')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Source language code must be 2-5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      return res.status(500).json({ 
        error: 'Translation service not configured. Please set up Google Translate API key.' 
      });
    }

    // Call Google Translate API
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2`,
      {},
      {
        params: {
          q: text,
          target: targetLanguage,
          source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
          key: process.env.GOOGLE_TRANSLATE_API_KEY
        }
      }
    );

    const translation = response.data.data.translations[0].translatedText;
    const detectedSourceLanguage = response.data.data.translations[0].detectedSourceLanguage || sourceLanguage;

    res.json({
      originalText: text,
      translatedText: translation,
      sourceLanguage: detectedSourceLanguage,
      targetLanguage
    });
  } catch (error) {
    console.error('Translation error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Translation service error', details: error?.response?.data || error.message });
  }
});

// @route   GET /api/translation/languages
// @desc    Get supported languages
// @access  Private
router.get('/languages', auth, async (req, res) => {
  try {
    // Common languages supported by Google Translate
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese (Simplified)' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'sv', name: 'Swedish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'da', name: 'Danish' },
      { code: 'fi', name: 'Finnish' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' },
      { code: 'he', name: 'Hebrew' },
      { code: 'th', name: 'Thai' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ms', name: 'Malay' },
      { code: 'fa', name: 'Persian' },
      { code: 'ur', name: 'Urdu' },
      { code: 'bn', name: 'Bengali' },
      { code: 'ta', name: 'Tamil' },
      { code: 'te', name: 'Telugu' },
      { code: 'mr', name: 'Marathi' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'pa', name: 'Punjabi' }
    ];

    res.json({ languages });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ error: 'Server error getting languages' });
  }
});

module.exports = router; 