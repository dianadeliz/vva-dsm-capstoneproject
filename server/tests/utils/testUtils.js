const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Create a test user and return the user object and token
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  const user = new User({ ...defaultUser, ...userData });
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { user, token };
};

// Generate a valid JWT token for a user ID
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Create a test app instance for supertest
const createTestApp = () => {
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  
  const app = express();
  
  // Apply middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  return app;
};

module.exports = {
  createTestUser,
  generateToken,
  createTestApp
}; 