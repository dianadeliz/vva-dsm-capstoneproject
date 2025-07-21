# Testing Guide

This document provides comprehensive information about the testing setup and how to run tests for the Voice Virtual Assistant project.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Writing Tests](#writing-tests)
6. [Test Best Practices](#test-best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

The project uses Jest as the primary testing framework with the following testing libraries:

### Server-side Testing
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for testing Express.js applications
- **MongoDB Memory Server**: In-memory MongoDB for testing database operations

### Client-side Testing
- **Jest**: Test runner and assertion library
- **React Testing Library**: Testing utilities for React components
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

## Test Structure

```
├── server/
│   ├── tests/
│   │   ├── setup.js                 # Jest setup for server tests
│   │   ├── utils/
│   │   │   └── testUtils.js         # Common test utilities
│   │   ├── models/
│   │   │   └── User.test.js         # User model tests
│   │   ├── middleware/
│   │   │   └── auth.test.js         # Authentication middleware tests
│   │   └── routes/
│   │       └── auth.test.js         # Authentication route tests
│   └── package.json                 # Server dependencies and test scripts
├── client/
│   ├── src/
│   │   ├── setupTests.js            # Jest setup for client tests
│   │   ├── __tests__/
│   │   │   └── App.test.js          # App component tests
│   │   ├── contexts/
│   │   │   └── __tests__/
│   │   │       └── AuthContext.test.js  # Auth context tests
│   │   ├── components/
│   │   │   └── auth/
│   │   │       └── __tests__/
│   │   │           └── Login.test.js     # Login component tests
│   │   └── services/
│   │       └── __tests__/
│   │           └── weatherService.test.js # Weather service tests
│   └── package.json                 # Client dependencies and test scripts
└── package.json                     # Root package.json with test scripts
```

## Running Tests

### Prerequisites

1. Install all dependencies:
```bash
npm run install-all
```

2. Set up environment variables for testing:
   - Copy `server/env.example` to `server/.env.test`
   - Configure test database and other test-specific variables

### Running All Tests

```bash
# Run both client and server tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Running Server Tests Only

```bash
# Run server tests once
npm run test:server

# Run server tests in watch mode
npm run test:server:watch

# Run server tests with coverage
npm run test:server:coverage
```

### Running Client Tests Only

```bash
# Run client tests once
npm run test:client

# Run client tests in watch mode
npm run test:client:watch

# Run client tests with coverage
npm run test:client:coverage
```

### Individual Test Files

```bash
# Run specific server test file
cd server && npm test -- User.test.js

# Run specific client test file
cd client && npm test -- Login.test.js
```

## Test Coverage

### Coverage Reports

After running tests with coverage, you can find coverage reports in:

- **Server**: `server/coverage/lcov-report/index.html`
- **Client**: `client/coverage/lcov-report/index.html`

### Coverage Thresholds

The project aims for the following coverage thresholds:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

## Writing Tests

### Server-side Test Structure

```javascript
const request = require('supertest');
const express = require('express');
const { createTestUser } = require('../utils/testUtils');

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Method Name', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const testData = { /* test data */ };
      
      // Act
      const response = await request(app)
        .post('/api/endpoint')
        .send(testData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('expectedProperty');
    });

    it('should handle errors gracefully', async () => {
      // Test error scenarios
    });
  });
});
```

### Client-side Test Structure

```javascript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ComponentName from '../ComponentName';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ComponentName />
    </BrowserRouter>
  );
};

describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component correctly', () => {
      renderComponent();
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle user input correctly', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const input = screen.getByLabelText('Input Label');
      await user.type(input, 'test input');
      
      expect(input).toHaveValue('test input');
    });
  });

  describe('API Integration', () => {
    it('should call API and update state', async () => {
      // Mock API response
      axios.get.mockResolvedValueOnce({ data: { result: 'success' } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('success')).toBeInTheDocument();
      });
    });
  });
});
```

### Testing Utilities

#### Server Test Utilities (`server/tests/utils/testUtils.js`)

```javascript
// Create a test user
const { user, token } = await createTestUser();

// Generate JWT token
const token = generateToken(userId);

// Create test app instance
const app = createTestApp();
```

#### Client Test Setup (`client/src/setupTests.js`)

The setup file includes:
- Jest DOM matchers
- Mock implementations for external libraries
- Global mocks for browser APIs

## Test Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Mocking

- Mock external dependencies (APIs, databases, etc.)
- Use `jest.mock()` for module mocking
- Create realistic mock data that matches the actual API responses

### 3. Async Testing

- Use `async/await` for asynchronous operations
- Use `waitFor()` for testing asynchronous state changes
- Handle promises properly in tests

### 4. Error Testing

- Test both success and failure scenarios
- Verify error messages and status codes
- Test edge cases and boundary conditions

### 5. Component Testing

- Test user interactions (clicks, form submissions, etc.)
- Test component state changes
- Test prop changes and their effects
- Test accessibility features

### 6. API Testing

- Test all HTTP methods (GET, POST, PUT, DELETE)
- Test request validation
- Test response formatting
- Test error handling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Ensure MongoDB Memory Server is properly configured
   - Check that the test database is isolated from development

2. **Jest Configuration Issues**
   - Verify `setupFilesAfterEnv` is correctly configured
   - Check that all mocks are properly set up

3. **React Testing Library Issues**
   - Use `screen.getBy*` queries instead of direct DOM manipulation
   - Wait for asynchronous operations with `waitFor()`

4. **Coverage Issues**
   - Ensure all code paths are tested
   - Check that mocks don't interfere with coverage reporting

### Debugging Tests

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debug logging
DEBUG=* npm test

# Run a single test file with debugging
npm test -- --runInBand --verbose ComponentName.test.js
```

### Performance Optimization

1. **Parallel Test Execution**
   - Server and client tests run in parallel
   - Use `--maxWorkers` to control Jest worker count

2. **Test Isolation**
   - Each test should be independent
   - Clean up after each test to prevent interference

3. **Mock Optimization**
   - Mock heavy operations (file I/O, network requests)
   - Use `jest.fn()` for simple function mocks

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run install-all
    npm test
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve test coverage
4. Update this documentation if needed

For questions about testing, refer to:
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest) 