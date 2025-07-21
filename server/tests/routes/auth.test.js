const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const User = require('../../models/User');
const { createTestUser } = require('../utils/testUtils');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'email')).toBe(true);
    });

    it('should return 400 for short username', async () => {
      const userData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'username')).toBe(true);
    });

    it('should return 400 for short password', async () => {
      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'password')).toBe(true);
    });

    it('should return 400 for password without number', async () => {
      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'password')).toBe(true);
    });

    it('should return 400 for mismatched passwords', async () => {
      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'confirmPassword')).toBe(true);
    });

    it('should return 400 for duplicate email', async () => {
      const existingUser = await createTestUser();

      const userData = {
        username: 'newuser',
        email: existingUser.user.email,
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email already registered');
    });

    it('should return 400 for duplicate username', async () => {
      const existingUser = await createTestUser();

      const userData = {
        username: existingUser.user.username,
        email: 'newemail@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Username already taken');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const { user } = await createTestUser();

      const loginData = {
        email: user.email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.username).toBe(user.username);
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const { user } = await createTestUser();

      const loginData = {
        email: user.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'email')).toBe(true);
    });

    it('should return 400 for missing password', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'password')).toBe(true);
    });

    it('should update lastLogin timestamp on successful login', async () => {
      const { user } = await createTestUser();
      const originalLastLogin = user.lastLogin;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      const loginData = {
        email: user.email,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Check if lastLogin was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.lastLogin.getTime()).toBeGreaterThan(originalLastLogin.getTime());
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset email for existing user', async () => {
      const { user } = await createTestUser();

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: user.email })
        .expect(200);

      expect(response.body.message).toBe('Password reset email sent');

      // Verify reset token was saved
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeDefined();
      expect(updatedUser.resetPasswordExpires).toBeDefined();
    }, 10000);

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'email')).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    it('should reset password with valid token', async () => {
      const { user } = await createTestUser();
      
      // Create reset token manually
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      const newPassword = 'newpassword123';

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: newPassword })
        .expect(200);

      expect(response.body.message).toBe('Password reset successful');

      // Verify password was changed
      const updatedUser = await User.findById(user._id);
      const isPasswordValid = await updatedUser.comparePassword(newPassword);
      expect(isPasswordValid).toBe(true);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password/invalid-token')
        .send({ password: 'newpassword123' })
        .expect(400);

      expect(response.body.error).toBe('Invalid or expired reset token');
    });

    it('should return 400 for expired token', async () => {
      const { user } = await createTestUser();
      
      // Create expired reset token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() - 1000; // Expired
      await user.save();

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: 'newpassword123' })
        .expect(400);

      expect(response.body.error).toBe('Invalid or expired reset token');
    });

    it('should return 400 for weak password', async () => {
      const { user } = await createTestUser();
      
      // Create reset token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: 'weak' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.path === 'password')).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const { user, token } = await createTestUser();

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(user._id.toString());
      expect(response.body.user.username).toBe(user.username);
      expect(response.body.user.email).toBe(user.email);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token.');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });
  });
}); 