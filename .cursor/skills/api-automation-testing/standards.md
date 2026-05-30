# API Automation Testing Standards

Full rules from `.cursor/rules/APITestingRules.mdc`. Read when implementing or extending the framework.

## API Discovery

- Swagger: `https://fakerestapi.azurewebsites.net/swagger/v1/swagger.json`
- Parse and validate spec before test generation
- Discover all controllers, endpoints, methods, parameters, bodies, schemas, status codes, security
- Generate tests for every endpoint; detect new endpoints automatically
- Validate Swagger definitions match actual API responses

## Technology Stack

Playwright Test Runner, `APIRequestContext`, TypeScript, strict mode, ESLint/Prettier, async/await, API Client layer.

## Validation Requirements

**Functional:** status code, headers, content-type, body, required/optional fields, schema, types, enums, pagination/sort/filter where applicable.

**CRUD:** create (success, duplicate, missing fields, invalid payload); read (all, by ID, invalid ID, non-existing); update (success, partial, invalid, non-existing); delete (success, already deleted, invalid ID).

**Status codes:** 200, 201, 202, 204, 400, 401, 403, 404, 405, 409, 415, 422, 429, 500, 502, 503 (validate all applicable).

**Schema:** fail on missing required fields, unexpected fields, wrong types, invalid enums.

**Performance:** GET < 2000ms, POST/PUT/DELETE < 3000ms; flag slower as warnings.

**Security:** missing/invalid/expired tokens, invalid content-type, injection, XSS, SQLi, header manipulation, large payloads. Never log secrets.

## Reporting

Standalone HTML report in `reports/` with dark theme, dashboard (totals, pass/fail/skip/warn, success rate, response times), expandable endpoint details, charts and status badges. Also JUnit and JSON for CI.

Each endpoint row must show inline: pass/fail badge, test title, scenario tag (`[POSITIVE]`, `[NEGATIVE]`, `[BOUNDARY]`, `[SECURITY]`), HTTP status code, and response time.

Expanded endpoint view must show: resolved URL (e.g. `GET /api/v1/Users/56`), test data used (e.g. `ID=56`), request body, response body, and accurate API response time (not 0ms).

Log entries must include `testTitle`, `resolvedEndpoint`, `scenarioType`, `testDataInfo`, and `responseTimeMs` captured at request time via the API client layer.

## Coverage

100% endpoint and controller coverage with positive, negative, schema, error handling, and reporting coverage.
