const express = require('express');
const auth = require('../middleware/auth');
const axios = require('axios');
const router = express.Router();

// AI chat route using OpenRouter
router.post('/ai', auth, async (req, res) => {
  const { message, imageUrl } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "qwen/qwen2.5-vl-32b-instruct:free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: message },
              ...(imageUrl
                ? [{ type: "image_url", image_url: { url: imageUrl } }]
                : [])
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || '',
          'X-Title': process.env.SITE_NAME || '',
        }
      }
    );
    res.json({ aiResponse: response.data.choices[0].message.content });
  } catch (error) {
    console.error('AI chat error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'AI chat service error', details: error?.response?.data || error.message });
  }
});

module.exports = router; 