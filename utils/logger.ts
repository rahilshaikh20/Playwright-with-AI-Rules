import * as fs from 'fs';
import * as path from 'path';

export type ScenarioType = 'POSITIVE' | 'NEGATIVE' | 'BOUNDARY' | 'SECURITY';

export interface LogEntry {
  timestamp: string;
  testTitle: string;
  endpoint: string;
  method: string;
  url: string;
  resolvedEndpoint: string;
  scenarioType: ScenarioType;
  testDataInfo: string;
  queryParams?: Record<string, string>;
  requestHeaders?: Record<string, string>;
  requestPayload?: unknown;
  responseHeaders?: Record<string, string>;
  responsePayload?: unknown;
  statusCode: number;
  responseTimeMs: number;
  correlationId?: string;
  result: 'passed' | 'failed' | 'warning';
  failureReason?: string;
}

const logsDir = path.join(process.cwd(), 'reports', 'logs');

function ensureLogsDir(): void {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

export function logRequest(entry: LogEntry): void {
  ensureLogsDir();
  const safeEntry = { ...entry };
  if (safeEntry.requestHeaders?.Authorization) {
    safeEntry.requestHeaders = { ...safeEntry.requestHeaders, Authorization: '[REDACTED]' };
  }
  if (safeEntry.requestPayload && typeof safeEntry.requestPayload === 'object') {
    const payload = { ...(safeEntry.requestPayload as Record<string, unknown>) };
    if ('password' in payload) payload.password = '[REDACTED]';
    safeEntry.requestPayload = payload;
  }
  const filePath = path.join(logsDir, `api-log-${new Date().toISOString().slice(0, 10)}.jsonl`);
  fs.appendFileSync(filePath, JSON.stringify(safeEntry) + '\n');
}

export function getLogs(): LogEntry[] {
  ensureLogsDir();
  const files = fs.readdirSync(logsDir).filter((f) => f.endsWith('.jsonl'));
  const entries: LogEntry[] = [];
  for (const file of files) {
    const lines = fs.readFileSync(path.join(logsDir, file), 'utf-8').split('\n').filter(Boolean);
    for (const line of lines) {
      entries.push(JSON.parse(line) as LogEntry);
    }
  }
  return entries;
}

export function clearLogs(): void {
  if (fs.existsSync(logsDir)) {
    fs.rmSync(logsDir, { recursive: true });
  }
}
