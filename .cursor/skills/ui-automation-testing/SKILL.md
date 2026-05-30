---
name: ui-automation-testing
description: >-
  Build and run Playwright TypeScript UI automation with Page Object Model, manual test cases,
  Allure reporting, and test data management. Targets practicetestautomation.com login flows.
  Use when creating UI tests, browser automation, POM pages, Allure reports, or when UITestingRules apply.
---

# UI Automation Testing

Follow [standards.md](standards.md). Source: `.cursor/rules/UITestingRules.mdc`.

**Target app:** `https://practicetestautomation.com/practice-test-login/`

## Workflow

```
Task Progress:
- [ ] Step 1: Explore application (pages, forms, flows)
- [ ] Step 2: Document manual test cases in testcases/
- [ ] Step 3: Create page objects in pages/
- [ ] Step 4: Add test data in testData/ and config in config/
- [ ] Step 5: Implement tests/ui/<Module>.spec.ts
- [ ] Step 6: Run tests and generate Allure report
```

### Step 1: Explore

Use Playwright MCP or browser to map navigation, inputs, buttons, validations, success/error messages.

### Step 2: Manual Test Cases

One markdown file per module under `testcases/` using the template:

```markdown
Test Case ID:
Module:
Title:
Priority:
Preconditions:
Test Data:
Steps:
Expected Result:
Post Conditions:
Automation Candidate: Yes/No
```

Cover positive, negative, boundary, and UI validation scenarios.

### Step 3: Page Objects

One page class per module in `pages/`. Each contains locators, actions, and validation methods. No hardcoded waits.

Locator priority: `data-testid` → `aria-label` → `role` → `text` → CSS → XPath.

### Step 4: Test Data & Config

- `testData/loginTestData.json` — credentials, messages (never hardcode in tests)
- `config/env.ts`, `config/urls.ts`, `config/constants.ts` — URLs, timeouts, browser settings

### Step 5: Write Tests

Location: `tests/ui/<Module>.spec.ts`

```typescript
test.describe('Login Module', () => {
  test.beforeEach(async ({ page }) => { /* navigate */ });
  test('TC-001 Valid login', async ({ page }) => {
    await test.step('Enter credentials', async () => { /* ... */ });
  });
});
```

Use Allure annotations: `allure.epic()`, `allure.feature()`, `allure.story()`, `allure.severity()`.

### Step 6: Run

```bash
npm run test:ui
npm run test:ui:report    # clean → test → generate single-file report
npm run allure:serve      # recommended: local HTTP server (best experience)
npm run allure:open       # open multi-file report via HTTP server
```

**Important:** Do not open `allure-report/index.html` directly in the browser (file://). Allure loads data via HTTP fetch and will show errors like "500 failed" with no stats. Use `npm run allure:serve` or `npm run test:ui:report` (generates a self-contained single-file report that works when opened directly).

Artifacts: `allure-results/`, `allure-report/`, `screenshots/`, `videos/`, `traces/`, `logs/`.

## Key Constraints

| Area | Rule |
|------|------|
| Pattern | Page Object Model |
| Waits | `expect().toBeVisible()` — never `waitForTimeout()` |
| Data | Centralized JSON, no hardcoded credentials |
| Reporting | Allure mandatory |
| Capture | Screenshot/video/trace on failure |
| Isolation | Independent tests, no execution order dependency |

## Additional Resources

- Full standards: [standards.md](standards.md)
- Project rules: `.cursor/rules/UITestingRules.mdc`
