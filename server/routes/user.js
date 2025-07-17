const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;

    // Check if username or email already exists
    if (username || email) {
      const existingUser = await User.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : [])
        ],
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({
          error: existingUser.email === email 
            ? 'Email already registered' 
            : 'Username already taken'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// @route   POST /api/user/chat
// @desc    Save chat message
// @access  Private
router.post('/chat', auth, [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, sessionId, response } = req.body;

    // Find existing chat session or create new one
    let chat = await Chat.findOne({
      userId: req.user._id,
      sessionId
    });

    if (!chat) {
      chat = new Chat({
        userId: req.user._id,
        sessionId,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message
    });

    // Add assistant response if provided
    if (response) {
      chat.messages.push({
        role: 'assistant',
        content: response
      });
    }

    await chat.save();

    res.json({ message: 'Chat saved successfully', chat });
  } catch (error) {
    console.error('Save chat error:', error);
    res.status(500).json({ error: 'Server error saving chat' });
  }
});

// @route   GET /api/user/chat/:sessionId
// @desc    Get chat history for a session
// @access  Private
router.get('/chat/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chat = await Chat.findOne({
      userId: req.user._id,
      sessionId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Server error getting chat' });
  }
});

// @route   GET /api/user/chat-sessions
// @desc    Get all chat sessions for user
// @access  Private
router.get('/chat-sessions', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('sessionId messages createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(20);

    const sessions = chats.map(chat => ({
      sessionId: chat.sessionId,
      messageCount: chat.messages.length,
      lastMessage: chat.messages[chat.messages.length - 1]?.content || '',
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));

    res.json({ sessions });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Server error getting chat sessions' });
  }
});

// @route   DELETE /api/user/chat/:sessionId
// @desc    Delete a chat session
// @access  Private
router.delete('/chat/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chat = await Chat.findOneAndDelete({
      userId: req.user._id,
      sessionId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Server error deleting chat' });
  }
});

module.exports = router; 