# E2E Tests - BranchFeed

End-to-end tests for critical user flows using Playwright.

## Setup

E2E tests are configured with Playwright. To run tests:

```bash
# Install Playwright browsers (first time only)
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

## Test Structure

```
e2e/
├── auth.spec.ts          # Authentication flows (sign up, sign in, sign out)
├── story-creation.spec.ts # Story creation flow
├── story-interaction.spec.ts # Story viewing and interaction (choices, like, comment)
└── profile.spec.ts       # Profile and settings flows
```

## Critical Test Scenarios

### 1. Authentication Flow (`auth.spec.ts`)
- ✅ User can sign up with valid credentials
- ✅ User cannot sign up with invalid email
- ✅ User cannot sign up with weak password
- ✅ User can sign in with valid credentials
- ✅ User cannot sign in with invalid credentials

### 2. Story Creation Flow (`story-creation.spec.ts`)
- ✅ User can navigate to create page
- ✅ User can fill root story form
- ✅ User can see step indicator
- ✅ User can proceed to branches step
- ✅ Create page shows validation errors

### 3. Story Interaction Flow (`story-interaction.spec.ts`)
- ✅ User can view feed page
- ✅ User can click on a story card
- ✅ User can see story player on detail page
- ✅ User can see choice buttons
- ✅ User can click choice button
- ✅ User can see interaction buttons
- ✅ User can see path progress indicator

### 4. Profile Flow (`profile.spec.ts`)
- ✅ User can navigate to profile page
- ✅ User can navigate to settings page
- ✅ User can see profile settings form
- ✅ User can edit username
- ✅ User can see avatar upload section
- ✅ User can view own stories on profile

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000` (or `PLAYWRIGHT_TEST_BASE_URL` env var)
- Browser: Chromium (can be extended to Firefox/WebKit)
- Auto-start dev server before tests
- Screenshots on failure
- Trace on retry

## Environment Variables

- `PLAYWRIGHT_TEST_BASE_URL` - Base URL for tests (default: `http://localhost:3000`)
- `CI` - Set to `true` in CI environments (enables retries, single worker)

## Notes

- Tests assume dev server is running or will be started automatically
- Some tests require authenticated users (use Playwright's auth state for real tests)
- Tests may need test data setup (stories, users) for full coverage
- Update selectors if UI changes

## Running Specific Tests

```bash
# Run specific test file
pnpm test:e2e auth.spec.ts

# Run tests matching pattern
pnpm test:e2e --grep "sign up"

# Run in specific browser
pnpm test:e2e --project=chromium
```

## Debugging

1. **UI Mode**: `pnpm test:e2e:ui` - Interactive test runner
2. **Headed Mode**: `pnpm test:e2e:headed` - See browser during tests
3. **Debug Mode**: `pnpm test:e2e:debug` - Step through tests
4. **Trace Viewer**: After failed test, run `npx playwright show-trace trace.zip`

## CI Integration

For CI/CD pipelines:

```bash
# Install browsers
npx playwright install --with-deps chromium

# Run tests
CI=true pnpm test:e2e
```

---

**Status**: ✅ **SETUP COMPLETE**  
**Last Updated**: 2025-01-15

