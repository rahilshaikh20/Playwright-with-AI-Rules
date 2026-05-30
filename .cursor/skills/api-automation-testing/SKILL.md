---
name: api-automation-testing
description: >-
  Build and run Playwright TypeScript API automation tests from Swagger/OpenAPI specs.
  Generates controller-based tests, schema validation, CRUD coverage, performance checks,
  and HTML reports. Use when creating API tests, testing REST endpoints, working with
  FakeRESTApi, or when APITestingRules apply.
---

# API Automation Testing

Follow [standards.md](standards.md) for full rules. Source of truth: `.cursor/rules/APITestingRules.mdc`.

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Parse Swagger spec
- [ ] Step 2: Scaffold / verify project structure
- [ ] Step 3: Generate or update API clients, schemas, test data
- [ ] Step 4: Generate or update controller test files
- [ ] Step 5: Run tests and generate reports
- [ ] Step 6: Verify 100% endpoint coverage
```

### Step 1: Parse Swagger

- Swagger URL lives in `config/api.config.ts`
- Run `npx ts-node utils/swaggerParser.ts` or use `SwaggerParser` class to discover controllers, endpoints, methods, schemas, and status codes
- Validate spec before generating tests

### Step 2: Project Structure

Required layout:

```text
tests/<Controller>/<Controller>_test.ts
testData/<Controller>/<Controller>_testData.json
apiClients/<Controller>Client.ts
schemas/<Controller>.schema.json
utils/  config/  reports/
playwright.config.ts
```

### Step 3: Generate Artifacts

For each Swagger controller tag:

1. Create `<Controller>Client.ts` using `APIRequestContext`
2. Create `<Controller>.schema.json` from Swagger components
3. Create `<Controller>_testData.json` with valid, invalid, boundary payloads
4. Never hardcode bodies in test files

### Step 4: Write Tests

One file per controller: `tests/<Controller>/<Controller>_test.ts`

```typescript
test.describe('<Controller> Controller', () => {
  // All endpoints for this controller
});
```

Every endpoint must cover:

- Functional: status, headers, content-type, body, schema, types
- CRUD: create/read/update/delete positive and negative cases
- Performance: GET < 2000ms, POST/PUT/DELETE < 3000ms (warn if slower)
- Security: invalid content-type, injection payloads where applicable

Use shared helpers from `utils/testHelpers.ts`, `utils/schemaValidator.ts`, `utils/logger.ts`.

### Step 5: Run Tests

```bash
npm install
npx playwright install
npm test
```

Reports output to `reports/`:

- `api-test-report.html` — dark-theme dashboard with inline status codes, scenario tags `[POSITIVE]`/`[NEGATIVE]`/`[BOUNDARY]`/`[SECURITY]`, resolved endpoint URLs, test data info, and accurate response times
- `results.json` — JSON results
- `junit.xml` — CI-compatible
- `logs/` — per-request JSONL logs linked to test titles

### Report Row Format

Each endpoint row in the HTML report shows:

- Pass/fail badge, test title, scenario tag (e.g. `[NEGATIVE]`), HTTP status code, response time
- On expand: resolved URL (e.g. `GET /api/v1/Users/56`), test data (e.g. `ID=56`), request/response bodies

Ensure `validateApiResponse()` is used for every API call so logs capture timing, scenario, and test data via `utils/testHelpers.ts` and `utils/reportHelper.ts`.

### Step 6: Coverage Check

Confirm every Swagger path/method has at least one test. No endpoint may remain untested.

## Key Constraints

| Area | Rule |
|------|------|
| Stack | Playwright + TypeScript + async/await |
| Clients | API Client layer (POM for APIs) |
| Config | Swagger URL and auth tokens in separate config files |
| Secrets | Never log tokens, passwords, or API keys |
| Failures | Capture full request/response, continue remaining tests |
| Data | Dynamic unique data, independent tests, cleanup after run |

## Additional Resources

- Full standards: [standards.md](standards.md)
- Project rules: `.cursor/rules/APITestingRules.mdc`
