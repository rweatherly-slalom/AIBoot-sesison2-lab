# Testing Guidelines

This document defines the required testing strategy and standards for the TODO app.

## Core Principles

- All new features must include appropriate tests.
- Tests must be maintainable, readable, and aligned with best practices.
- All tests must be isolated and independent.
- Each test must set up its own data and must not rely on execution order or other tests.
- Setup and teardown hooks are required so tests can run successfully multiple times.

## Unit Tests

- Framework: Use Jest to test individual functions and React components in isolation.
- Naming convention: Unit tests must use `*.test.js` or `*.test.ts`.
- Backend location: Place backend unit tests in `packages/backend/__tests__/`.
- Frontend location: Place frontend unit tests in `packages/frontend/src/__tests__/`.
- File naming: Name unit test files to match what they test.
  - Example: `app.test.js` tests `app.js`.

## Integration Tests

- Frameworks: Use Jest + Supertest to test backend API endpoints with real HTTP requests.
- Location: Place integration tests in `packages/backend/__tests__/integration/`.
- Naming convention: Integration tests must use `*.test.js` or `*.test.ts`.
- File naming: Name integration test files based on the API surface they cover.
  - Example: `todos-api.test.js` for TODO API endpoints.

## End-to-End (E2E) Tests

- Required framework: Use Playwright for complete UI workflow testing through browser automation.
- Location: Place E2E tests in `tests/e2e/`.
- Naming convention: E2E tests must use `*.spec.js` or `*.spec.ts`.
- File naming: Name E2E files based on the user journey.
  - Example: `todo-workflow.spec.js`.
- Browser scope: Playwright tests must use one browser only.
- Architecture: Playwright tests must use the Page Object Model (POM) pattern for maintainability.
- Coverage limit: Maintain only 5-8 critical E2E user journeys, focused on happy paths and key edge cases.

## Port Configuration

- Always use environment variables with sensible defaults for port configuration.
- Backend standard:

```js
const PORT = process.env.PORT || 3030;
```

- Frontend standard:
  - React default development port is 3000.
  - Allow overriding with the `PORT` environment variable.
- Purpose: This supports CI/CD workflows that dynamically detect and assign ports.

## Test Quality Expectations

- Keep test scopes focused: unit tests for logic, integration tests for API behavior, E2E tests for critical user journeys.
- Avoid brittle assertions tied to implementation details.
- Prefer deterministic test data and stable selectors.
- Review test suites regularly and refactor when they become hard to understand or maintain.