# TODO App UI Guidelines

## Design System and Components

1. The app should use Material UI components as the primary UI library.
2. All screens should follow a consistent 8px spacing system.
3. Use a simple layout structure:
   - top app bar for app title and primary actions
   - main content area for task list and filters
   - optional side panel or modal for task details

## Color Palette

1. Use a light-first theme with strong contrast.
2. Core colors:
   - Primary: #1565C0 (blue)
   - Secondary: #2E7D32 (green)
   - Error: #C62828 (red)
   - Warning: #ED6C02 (orange)
   - Background: #F7F9FC
   - Surface: #FFFFFF
   - Text Primary: #1A1A1A
   - Text Secondary: #4F4F4F
3. Do not rely on color alone to communicate status (for example, completed, overdue, or high priority).

## Typography

1. Use Roboto as the default font family to align with Material conventions.
2. Minimum body text size should be 16px.
3. Use clear visual hierarchy:
   - Page title: 24px, semibold
   - Section headers: 18px, semibold
   - Body text: 16px, regular
   - Supporting text: 14px, regular

## Buttons and Controls

1. Primary actions (for example, Add Task, Save) should use contained buttons.
2. Secondary actions (for example, Cancel, Clear Filters) should use outlined buttons.
3. Tertiary or low-emphasis actions can use text buttons.
4. Buttons must have visible hover, focus, and disabled states.
5. All interactive controls must have a minimum hit area of 44x44px.

## Task List Presentation

1. Each task row should display:
   - completion checkbox
   - task title
   - due date (if present)
   - priority indicator
   - quick actions (edit, delete)
2. Completed tasks should be visually distinct (for example, reduced emphasis and strikethrough title).
3. Overdue tasks should have a clear warning indicator and readable text contrast.

## Forms and Validation

1. Required fields must be clearly labeled.
2. Validation errors should appear inline near the related input.
3. Error messages should be specific and actionable.
4. Preserve user input when validation fails.

## Accessibility Requirements

1. Meet WCAG 2.1 AA contrast requirements for text and controls.
2. Ensure full keyboard navigation for all actions:
   - tab order follows visual order
   - all controls are reachable and operable by keyboard
3. All form controls must have associated labels.
4. Icon-only buttons must include accessible names (aria-label).
5. Provide visible focus indicators for all interactive elements.
6. Announce dynamic updates (for example, task added or deleted) for screen readers.

## Responsive Behavior

1. Support desktop, tablet, and mobile layouts.
2. On small screens, stack filters and actions vertically where needed.
3. Avoid horizontal scrolling for primary content.
4. Keep critical actions visible and easy to reach on mobile.

## Motion and Feedback

1. Use subtle transitions (150-250ms) for state changes and dialog appearance.
2. Provide immediate feedback for user actions (for example, snackbar on save/delete).
3. Respect reduced-motion preferences when enabled by the user.