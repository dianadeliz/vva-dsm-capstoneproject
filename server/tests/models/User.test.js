const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.lastLogin).toBeDefined();
    });

    it('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.username).toBeDefined();
    });

    it('should require email', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should require password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should enforce username length constraints', async () => {
      const userData = {
        username: 'ab', // Too short
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.username).toBeDefined();
    });

    it('should enforce password length constraints', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123' // Too short
      };

      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should enforce unique username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        username: 'testuser',
        email: 'test2@example.com',
        password: 'password123'
      });

      let error;
      try {
        await duplicateUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should enforce unique email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123'
      });

      let error;
      try {
        await duplicateUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
    });

    it('should not rehash password if not modified', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      const originalHash = user.password;

      // Update non-password field
      user.username = 'newusername';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      const isValid = await user.comparePassword('password123');
      expect(isValid).toBe(true);
    });

    it('should correctly compare invalid password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      const isValid = await user.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('toJSON Method', () => {
    it('should exclude sensitive fields when converting to JSON', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      const userJson = user.toJSON();

      expect(userJson.password).toBeUndefined();
      expect(userJson.resetPasswordToken).toBeUndefined();
      expect(userJson.resetPasswordExpires).toBeUndefined();
      expect(userJson.username).toBe(userData.username);
      expect(userJson.email).toBe(userData.email);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });
}); 