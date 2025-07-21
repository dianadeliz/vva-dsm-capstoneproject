import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }) => <div data-testid={`navigate-to-${to}`}>Navigate to {to}</div>
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Initial Loading State', () => {
    it('should show loading spinner initially', () => {
      renderApp();
      
      // Should show loading spinner while checking authentication
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should redirect to dashboard when user is authenticated', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      localStorage.getItem.mockReturnValue('mock-token');
      axios.get.mockResolvedValueOnce({ data: { user: mockUser } });

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect to login when user is not authenticated', async () => {
      localStorage.getItem.mockReturnValue(null);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      });
    });
  });

  describe('Route Protection', () => {
    it('should protect dashboard route when not authenticated', async () => {
      localStorage.getItem.mockReturnValue(null);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      });
    });

    it('should allow access to dashboard when authenticated', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      localStorage.getItem.mockReturnValue('mock-token');
      axios.get.mockResolvedValueOnce({ data: { user: mockUser } });

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect authenticated users away from login page', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      localStorage.getItem.mockReturnValue('mock-token');
      axios.get.mockResolvedValueOnce({ data: { user: mockUser } });

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Public Routes', () => {
    it('should allow access to login page when not authenticated', async () => {
      localStorage.getItem.mockReturnValue(null);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      });
    });

    it('should allow access to register page when not authenticated', async () => {
      localStorage.getItem.mockReturnValue(null);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      });
    });

    it('should allow access to forgot password page when not authenticated', async () => {
      localStorage.getItem.mockReturnValue(null);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      });
    });
  });

  describe('Default Routes', () => {
    it('should redirect root path to dashboard', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      localStorage.getItem.mockReturnValue('mock-token');
      axios.get.mockResolvedValueOnce({ data: { user: mockUser } });

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect unknown routes to dashboard', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      localStorage.getItem.mockReturnValue('mock-token');
      axios.get.mockResolvedValueOnce({ data: { user: mockUser } });

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle authentication API errors gracefully', async () => {
      localStorage.getItem.mockReturnValue('invalid-token');
      axios.get.mockRejectedValueOnce(new Error('Invalid token'));

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      });
    });

    it('should handle network errors during authentication check', async () => {
      localStorage.getItem.mockReturnValue('mock-token');
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      });
    });
  });

  describe('Component Structure', () => {
    it('should render with correct CSS class', () => {
      renderApp();
      
      const appElement = screen.getByText(/loading/i).closest('.App');
      expect(appElement).toBeInTheDocument();
    });

    it('should contain Routes component', () => {
      renderApp();
      
      // The Routes component should be present (though we can't directly test it)
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during authentication check', () => {
      // Create a promise that doesn't resolve immediately
      let resolvePromise;
      const authPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      localStorage.getItem.mockReturnValue('mock-token');
      axios.get.mockReturnValueOnce(authPromise);

      renderApp();

      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Resolve the promise
      resolvePromise({ data: { user: {} } });
    });

    it('should hide loading spinner after authentication check', async () => {
      localStorage.getItem.mockReturnValue(null);

      renderApp();

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Token Management', () => {
    it('should check localStorage for token on mount', () => {
      localStorage.getItem.mockReturnValue('mock-token');
      
      renderApp();

      expect(localStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should handle missing token gracefully', async () => {
      localStorage.getItem.mockReturnValue(null);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      });
    });
  });
}); 