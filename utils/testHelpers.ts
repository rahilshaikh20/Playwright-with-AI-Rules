import { APIResponse, expect, test } from '@playwright/test';
import { getResponseTime } from '../apiClients/BaseClient';
import { apiConfig } from '../config/api.config';
import { logRequest, LogEntry, ScenarioType } from './logger';
import { assertSchema, validateArrayItems } from './schemaValidator';

export interface ApiTestContext {
  controller: string;
  endpoint: string;
  method: string;
  url: string;
  requestPayload?: unknown;
  requestHeaders?: Record<string, string>;
  scenarioType?: ScenarioType;
  testDataInfo?: string;
}

export function inferScenarioType(title: string): ScenarioType {
  const lower = title.toLowerCase();
  if (lower.includes('injection') || lower.includes('xss') || lower.includes('sql')) {
    return 'SECURITY';
  }
  if (
    lower.includes('invalid') ||
    lower.includes('non-existing') ||
    lower.includes('duplicate') ||
    lower.includes('already deleted')
  ) {
    return 'NEGATIVE';
  }
  if (lower.includes('boundary')) {
    return 'BOUNDARY';
  }
  return 'POSITIVE';
}

export function buildTestDataInfo(ctx: ApiTestContext, testTitle: string): string {
  if (ctx.testDataInfo) return ctx.testDataInfo;

  const parts: string[] = [];
  const lower = testTitle.toLowerCase();

  if (ctx.endpoint.includes('{idBook}')) {
    const idBook = ctx.url.split('/').pop();
    if (idBook) parts.push(`idBook=${idBook}`);
  } else if (ctx.endpoint.includes('{id}')) {
    const id = ctx.url.split('/').pop();
    if (id) {
      const label = lower.includes('invalid') ? 'ID (invalid)' : lower.includes('non-existing') ? 'ID (non-existing)' : 'ID';
      parts.push(`${label}=${id}`);
    }
  }

  if (ctx.requestPayload && typeof ctx.requestPayload === 'object') {
    const payload = ctx.requestPayload as Record<string, unknown>;
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null && key !== 'password') {
        parts.push(`${key}=${String(value)}`);
      }
    }
  }

  return parts.length > 0 ? parts.join(', ') : 'Default request (no path params)';
}

export async function validateApiResponse(
  ctx: ApiTestContext,
  response: APIResponse,
  options: {
    expectedStatus?: number | number[];
    schema?: Record<string, unknown>;
    isArray?: boolean;
    itemSchema?: Record<string, unknown>;
    warnOnSlow?: boolean;
    responseTimeMs?: number;
  } = {},
): Promise<{ body: unknown; responseTimeMs: number; warning?: string }> {
  const testTitle = test.info().title;
  const responseTimeMs = options.responseTimeMs ?? getResponseTime(response) ?? 0;
  const status = response.status();
  const expected = options.expectedStatus ?? 200;
  const expectedStatuses = Array.isArray(expected) ? expected : [expected];

  let body: unknown;
  const contentType = response.headers()['content-type'] ?? '';
  if (contentType.includes('json') && status !== 204) {
    body = await response.json();
  } else {
    body = status === 204 ? null : await response.text();
  }

  const threshold =
    apiConfig.performanceThresholds[
      ctx.method as keyof typeof apiConfig.performanceThresholds
    ] ?? 3000;
  let warning: string | undefined;
  if (responseTimeMs > threshold) {
    warning = `Response time ${responseTimeMs}ms exceeds threshold ${threshold}ms`;
  }

  const scenarioType = ctx.scenarioType ?? inferScenarioType(testTitle);
  const testDataInfo = buildTestDataInfo(ctx, testTitle);
  const resolvedEndpoint = `${ctx.method} ${ctx.url}`;

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    testTitle,
    endpoint: ctx.endpoint,
    method: ctx.method,
    url: ctx.url,
    resolvedEndpoint,
    scenarioType,
    testDataInfo,
    requestHeaders: ctx.requestHeaders,
    requestPayload: ctx.requestPayload,
    responseHeaders: response.headers(),
    responsePayload: body,
    statusCode: status,
    responseTimeMs,
    result: expectedStatuses.includes(status) ? (warning ? 'warning' : 'passed') : 'failed',
    failureReason: expectedStatuses.includes(status) ? warning : `Expected ${expectedStatuses.join('|')}, got ${status}`,
  };
  logRequest(logEntry);

  expect(expectedStatuses, `Status code for ${ctx.method} ${ctx.endpoint}`).toContain(status);

  if (contentType && status !== 204 && body !== null && body !== '') {
    expect(contentType).toContain('json');
  }

  if (options.schema && body !== null && body !== '') {
    if (options.isArray && Array.isArray(body) && options.itemSchema) {
      const result = validateArrayItems(body, options.itemSchema);
      expect(result.valid, `Array schema validation for ${ctx.endpoint}`).toBe(true);
    } else if (!options.isArray) {
      assertSchema(body, options.schema, ctx.endpoint);
    }
  }

  if (options.warnOnSlow !== false && warning) {
    console.warn(`⚠️  ${ctx.method} ${ctx.endpoint}: ${warning}`);
  }

  return { body, responseTimeMs, warning };
}

export function sanitizeForLog(headers: Record<string, string>): Record<string, string> {
  const sanitized = { ...headers };
  if (sanitized.Authorization) sanitized.Authorization = '[REDACTED]';
  return sanitized;
}
