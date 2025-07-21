import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// Mock axios
const mockAxios = axios;
jest.mock('axios');

// Mock toast
const mockToast = toast;
jest.mock('react-hot-toast');

// Test component to access context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="user">{auth.user ? auth.user.username : 'no-user'}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.register({ username: 'test', email: 'test@example.com', password: 'password' })}>Register</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.forgotPassword('test@example.com')}>Forgot Password</button>
      <button onClick={() => auth.resetPassword('token', 'newpassword')}>Reset Password</button>
      <button onClick={() => auth.updateProfile({ username: 'newusername' })}>Update Profile</button>
    </div>
  );
};

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', async () => {
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
    });



    it('should handle failed user load on mount', async () => {
      localStorage.getItem.mockReturnValue('invalid-token');
      mockAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });

  describe('Login Function', () => {
    it('should login user successfully', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      const mockToken = 'mock-token';
      
      mockAxios.post.mockResolvedValueOnce({
        data: { user: mockUser, token: mockToken }
      });

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(mockToast.success).toHaveBeenCalledWith('Login successful!');
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    });

    it('should handle login failure', async () => {
      mockAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Invalid credentials' } }
      });

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });

      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should handle login network error', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Network error'));

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });

      expect(mockToast.error).toHaveBeenCalledWith('Login failed');
    });
  });

  describe('Register Function', () => {
    it('should register user successfully', async () => {
      const mockUser = { id: '1', username: 'newuser', email: 'new@example.com' };
      const mockToken = 'mock-token';
      
      mockAxios.post.mockResolvedValueOnce({
        data: { user: mockUser, token: mockToken }
      });

      renderWithAuth(<TestComponent />);

      const registerButton = screen.getByText('Register');
      await userEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user')).toHaveTextContent('newuser');
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/register', {
        username: 'test',
        email: 'test@example.com',
        password: 'password'
      });
      expect(mockToast.success).toHaveBeenCalledWith('Registration successful!');
    });

    it('should handle registration failure', async () => {
      mockAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Email already exists' } }
      });

      renderWithAuth(<TestComponent />);

      const registerButton = screen.getByText('Register');
      await userEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });

      expect(mockToast.error).toHaveBeenCalledWith('Email already exists');
    });
  });

  describe('Logout Function', () => {
    it('should logout user successfully', async () => {
      // First login
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      const mockToken = 'mock-token';
      
      mockAxios.post.mockResolvedValueOnce({
        data: { user: mockUser, token: mockToken }
      });

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      // Then logout
      mockAxios.post.mockResolvedValueOnce({ data: { message: 'Logged out' } });

      const logoutButton = screen.getByText('Logout');
      await userEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(mockToast.success).toHaveBeenCalledWith('Logged out successfully');
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle logout failure gracefully', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Network error'));

      renderWithAuth(<TestComponent />);

      const logoutButton = screen.getByText('Logout');
      await userEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });

      expect(mockToast.success).toHaveBeenCalledWith('Logged out successfully');
    });
  });

  describe('Forgot Password Function', () => {
    it('should send forgot password email successfully', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { message: 'Email sent' }
      });

      renderWithAuth(<TestComponent />);

      const forgotButton = screen.getByText('Forgot Password');
      await userEvent.click(forgotButton);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
        email: 'test@example.com'
      });
      expect(mockToast.success).toHaveBeenCalledWith('Password reset email sent!');
    });

    it('should handle forgot password failure', async () => {
      mockAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'User not found' } }
      });

      renderWithAuth(<TestComponent />);

      const forgotButton = screen.getByText('Forgot Password');
      await userEvent.click(forgotButton);

      expect(mockToast.error).toHaveBeenCalledWith('User not found');
    });
  });

  describe('Reset Password Function', () => {
    it('should reset password successfully', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { message: 'Password reset successful' }
      });

      renderWithAuth(<TestComponent />);

      const resetButton = screen.getByText('Reset Password');
      await userEvent.click(resetButton);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/reset-password/token', {
        password: 'newpassword'
      });
      expect(mockToast.success).toHaveBeenCalledWith('Password reset successful!');
    });

    it('should handle reset password failure', async () => {
      mockAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Invalid token' } }
      });

      renderWithAuth(<TestComponent />);

      const resetButton = screen.getByText('Reset Password');
      await userEvent.click(resetButton);

      expect(mockToast.error).toHaveBeenCalledWith('Invalid token');
    });
  });

  describe('Update Profile Function', () => {
    it('should update profile successfully', async () => {
      const mockUser = { id: '1', username: 'newusername', email: 'test@example.com' };
      
      mockAxios.put.mockResolvedValueOnce({
        data: { user: mockUser }
      });

      renderWithAuth(<TestComponent />);

      const updateButton = screen.getByText('Update Profile');
      await userEvent.click(updateButton);

      expect(mockAxios.put).toHaveBeenCalledWith('/api/user/profile', {
        username: 'newusername'
      });
      expect(mockToast.success).toHaveBeenCalledWith('Profile updated successfully!');
    });

    it('should handle profile update failure', async () => {
      mockAxios.put.mockRejectedValueOnce({
        response: { data: { error: 'Update failed' } }
      });

      renderWithAuth(<TestComponent />);

      const updateButton = screen.getByText('Update Profile');
      await userEvent.click(updateButton);

      expect(mockToast.error).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('Token Management', () => {
    it('should set axios authorization header when token exists', async () => {
      const mockToken = 'mock-token';
      const mockUser = { id: '1', username: 'testuser' };
      
      // Set up mocks before rendering
      localStorage.getItem.mockReturnValue(mockToken);
      mockAxios.get.mockResolvedValueOnce({ data: { user: mockUser } });

      renderWithAuth(<TestComponent />);

      // Wait for the loadUser effect to complete and check axios header
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith('/api/auth/me');
      }, { timeout: 3000 });

      expect(mockAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('should remove axios authorization header when token is null', async () => {
      localStorage.getItem.mockReturnValue(null);

      renderWithAuth(<TestComponent />);

      // Wait for the loadUser effect to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(mockAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('LocalStorage Token Loading', () => {
    it('should load user from localStorage token on mount', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      const mockToken = 'mock-token';
      
      // Set up localStorage mock before rendering
      localStorage.getItem.mockReturnValue(mockToken);
      mockAxios.get.mockResolvedValueOnce({ data: { user: mockUser } });

      renderWithAuth(<TestComponent />);

      // Wait for the async loadUser effect to complete
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith('/api/auth/me');
      }, { timeout: 3000 });

      // Now check the state after the API call completes
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      });

      expect(mockAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
}); 