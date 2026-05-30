# UI Automation Testing Standards

Full rules from `.cursor/rules/UITestingRules.mdc`.

## Target Application

`https://practicetestautomation.com/practice-test-login/`

Valid credentials: `student` / `Password123`

## Framework Stack

Playwright, TypeScript, POM, Allure, Node.js, ESLint, Prettier.

## Structure

```text
tests/ui/          pages/           testcases/
testData/          config/          utils/           fixtures/
reports/           allure-report/   screenshots/     videos/          traces/          logs/
```

## Test Naming

`<ModuleName>.spec.ts` under `tests/ui/`

## Coverage

Positive (valid flows), negative (invalid credentials, missing fields), boundary (empty/special chars), UI validation (labels, errors, success messages).

## Reporting

Allure with epic/feature/story/severity. Must include execution summary, steps, screenshots, videos, traces, failure analysis.

**Do not open `allure-report/index.html` via file://** — use `npm run allure:serve` or generate single-file report via `npm run allure:generate:single`. Multi-file reports require an HTTP server or stats will not load (shows "500 failed").

Log entries must include environment metadata via `allure-results/environment.properties`.

## CI/CD

Publish Allure report, screenshots, videos, traces, logs as artifacts.
