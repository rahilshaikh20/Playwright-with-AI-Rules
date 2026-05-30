import * as fs from 'fs';
import * as path from 'path';

export interface UiLogEntry {
  testTitle: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'passed' | 'failed' | 'skipped';
  browser: string;
  environment: string;
  failureReason?: string;
}

const logsDir = path.join(process.cwd(), 'logs');

function ensureLogsDir(): void {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

export function logUiTest(entry: UiLogEntry): void {
  ensureLogsDir();
  const filePath = path.join(logsDir, `ui-log-${new Date().toISOString().slice(0, 10)}.jsonl`);
  fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
}

export function clearUiLogs(): void {
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir).filter((f) => f.startsWith('ui-log-'));
    for (const file of files) {
      fs.unlinkSync(path.join(logsDir, file));
    }
  }
}
