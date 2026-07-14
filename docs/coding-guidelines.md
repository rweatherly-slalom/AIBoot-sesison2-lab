# Coding Guidelines

This project values clarity, consistency, and maintainability over cleverness. Code should be easy for another developer to understand, review, and safely change. Prefer small, focused changes that align with existing patterns in the codebase.

## Formatting and Readability

Use consistent formatting across backend and frontend code, and rely on project tooling where available instead of manual formatting. Keep functions and components focused on one responsibility, and prefer clear names over abbreviations. Avoid deeply nested logic when a guard clause or helper function can make control flow easier to follow.

Comments should explain intent when the code is not self-evident, but avoid redundant comments that restate obvious operations. If a block needs extensive explanation, consider refactoring it into smaller named units.

## Import Organization

Organize imports in a predictable order to reduce noise in code reviews:

1. Built-in or platform modules
2. Third-party dependencies
3. Internal project modules
4. Relative imports from the same feature or directory

Group related imports together and remove unused imports quickly. Prefer explicit imports over wildcard patterns to keep dependencies discoverable.

## Linting and Static Checks

Linting is required and should be treated as part of the development workflow, not a final cleanup step. Run linter checks before committing changes, and address warnings that indicate maintainability or correctness risks. Do not disable lint rules unless there is a clear, documented reason.

When possible, pair linting with automated tests to catch both style and behavior regressions early.

## Quality Principles

Follow the DRY (Don't Repeat Yourself) principle: extract duplicated logic into shared utilities, hooks, or modules when repetition appears. At the same time, avoid premature abstraction; duplication that is small and temporary can be acceptable until a clear reuse pattern emerges.

Prefer composition over large monolithic units. Keep modules cohesive, interfaces simple, and side effects controlled. Validate inputs at boundaries, handle errors explicitly, and fail with helpful messages.

## Frontend Practices

Build UI in reusable components with clear props and minimal implicit behavior. Keep state as local as practical, and avoid unnecessary global state. Separate display concerns from business logic where it improves testability.

Use accessible semantic elements by default and ensure interactive elements are keyboard-friendly. Avoid hardcoded style values when shared design tokens or theme values are available.

## Backend Practices

Keep route handlers thin and move core business logic into testable service functions. Validate request data consistently, and return clear, stable response shapes. Handle async errors explicitly and avoid swallowing exceptions.

Favor configuration through environment variables and sensible defaults. Keep startup and runtime behavior predictable across local development, tests, and CI.

## Testing and Maintainability

Write tests alongside feature work. Prefer tests that verify observable behavior rather than implementation details. Ensure tests remain deterministic and isolated so they can run repeatedly with consistent outcomes.

Refactor continuously in small steps: improve naming, remove dead code, and simplify conditionals while preserving behavior. Code quality is an ongoing practice, not a one-time phase.