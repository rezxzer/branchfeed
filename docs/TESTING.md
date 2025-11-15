# Testing Guide

This document describes the testing setup and strategy for BranchFeed.

**Status**: ✅ **SETUP COMPLETE**  
**Last Updated**: 2025-01-15

---

## 📋 Testing Stack

### Unit & Component Tests
- **Jest** - Test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers
- **@testing-library/user-event** - User interaction simulation

### E2E Tests (Future)
- **Playwright** or **Cypress** - End-to-end testing (not yet configured)

---

## 🚀 Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Run tests with coverage
```bash
pnpm test:coverage
```

---

## 📁 Test File Structure

Tests are located next to the components/utilities they test:

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
│   └── feed/
│       ├── FeedControls.tsx
│       └── __tests__/
│           └── FeedControls.test.tsx
└── lib/
    ├── utils.ts
    └── __tests__/
        └── utils.test.ts
```

---

## ✅ Current Test Coverage

### Component Tests
- ✅ `Button` - Variants, sizes, interactions, disabled state
- ✅ `Skeleton` - Variants, custom dimensions, styling
- ✅ `FeedControls` - Sort dropdown functionality

### Utility Tests
- ✅ `cn` (utils) - Class name merging and conditional classes

---

## 📝 Writing Tests

### Component Test Example

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Testing Best Practices

1. **Test user behavior, not implementation**
   - ✅ Test what users see and interact with
   - ❌ Don't test internal state or implementation details

2. **Use accessible queries**
   - ✅ `getByRole`, `getByLabelText`, `getByText`
   - ❌ Avoid `getByTestId` unless necessary

3. **Test user interactions**
   - Use `@testing-library/user-event` for realistic interactions
   - Test keyboard navigation, clicks, form submissions

4. **Keep tests simple and focused**
   - One test = one behavior
   - Use descriptive test names

---

## 🔄 Integration Tests

Integration tests verify that multiple components work together correctly.

### Example: Feed Page Integration

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { FeedPageClient } from '../FeedPageClient'

// Mock hooks and dependencies
jest.mock('@/hooks/useFeed', () => ({
  useFeed: () => ({
    stories: mockStories,
    loading: false,
    error: null,
    hasMore: true,
    loadMore: jest.fn(),
    sortBy: 'recent',
    setSortBy: jest.fn(),
  }),
}))

describe('FeedPageClient Integration', () => {
  it('displays stories from feed', async () => {
    render(<FeedPageClient />)
    
    await waitFor(() => {
      expect(screen.getByText('Story Title')).toBeInTheDocument()
    })
  })
})
```

---

## 🎭 E2E Tests ✅ COMPLETED

E2E tests verify complete user flows from start to finish using **Playwright**.

### ✅ Implemented E2E Test Scenarios

1. **User Authentication Flow** (`e2e/auth.spec.ts`)
   - ✅ Sign up with valid credentials
   - ✅ Sign up validation (invalid email, weak password)
   - ✅ Sign in with valid credentials
   - ✅ Sign in validation (invalid credentials)
   - ✅ Protected route redirects

2. **Story Creation Flow** (`e2e/story-creation.spec.ts`)
   - ✅ Navigate to create page
   - ✅ Fill root story form
   - ✅ Step indicator display
   - ✅ Proceed to branches step
   - ✅ Form validation errors

3. **Story Interaction Flow** (`e2e/story-interaction.spec.ts`)
   - ✅ View feed page
   - ✅ Click on story card
   - ✅ View story player
   - ✅ See choice buttons (A/B)
   - ✅ Click choice button
   - ✅ See interaction buttons (like, comment, share)
   - ✅ See path progress indicator

4. **Profile Flow** (`e2e/profile.spec.ts`)
   - ✅ Navigate to profile page
   - ✅ Navigate to settings page
   - ✅ View profile settings form
   - ✅ Edit username
   - ✅ See avatar upload section
   - ✅ View own stories

### E2E Testing Setup ✅ COMPLETED

**Playwright** is configured and ready to use:

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run all E2E tests
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug
```

**Configuration**: `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Browser: Chromium (extendable to Firefox/WebKit)
- Auto-start dev server
- Screenshots on failure
- Trace on retry

**Test Files**:
- `e2e/auth.spec.ts` - Authentication flows
- `e2e/story-creation.spec.ts` - Story creation flow
- `e2e/story-interaction.spec.ts` - Story viewing and interactions
- `e2e/profile.spec.ts` - Profile and settings flows

See `e2e/README.md` for detailed documentation.

---

## 🎯 Testing Priorities

### High Priority (Core Features)
- [x] UI Components (Button, Skeleton, etc.)
- [x] Utility functions (cn, etc.)
- [ ] Story creation flow
- [ ] Story player interactions
- [ ] Authentication flow

### Medium Priority (Features)
- [ ] Feed page functionality
- [ ] Profile page
- [ ] Comment system
- [ ] Like system
- [ ] Share functionality

### Low Priority (Polish)
- [ ] Error boundaries
- [ ] Loading states
- [ ] Toast notifications
- [ ] Responsive design

---

## 📊 Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities and pure functions
- **Component Tests**: 70%+ coverage for reusable components
- **Integration Tests**: Critical user flows covered
- **E2E Tests**: All critical paths covered

---

## 🐛 Debugging Tests

### Run single test file
```bash
pnpm test Button.test.tsx
```

### Run tests matching pattern
```bash
pnpm test --testNamePattern="renders"
```

### Debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright Documentation](https://playwright.dev/)

---

**Note**: This is a living document. Update it as testing practices evolve.

