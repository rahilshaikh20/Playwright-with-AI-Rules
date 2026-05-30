import * as fs from 'fs';
import * as path from 'path';
import { getLogs, LogEntry, ScenarioType } from './logger';

interface PlaywrightResult {
  suites?: PlaywrightSuite[];
  stats?: {
    expected: number;
    unexpected: number;
    skipped: number;
    duration: number;
  };
}

interface PlaywrightSuite {
  title: string;
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

interface PlaywrightSpec {
  title: string;
  ok: boolean;
  tests?: { results?: { status: string; duration: number; error?: { message: string } }[] }[];
}

interface EndpointRow {
  title: string;
  ok: boolean;
  duration: number;
  error?: string;
  controller: string;
  log?: LogEntry;
}

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  POSITIVE: '#3fb950',
  NEGATIVE: '#f85149',
  BOUNDARY: '#d29922',
  SECURITY: '#bc8cff',
};

export function generateHtmlReport(): string {
  const resultsPath = path.join(process.cwd(), 'reports', 'results.json');
  const logs = getLogs();

  let pwResults: PlaywrightResult = {};
  if (fs.existsSync(resultsPath)) {
    pwResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8')) as PlaywrightResult;
  }

  const stats = pwResults.stats ?? { expected: 0, unexpected: 0, skipped: 0, duration: 0 };
  const total = stats.expected + stats.unexpected + stats.skipped;
  const passed = stats.expected;
  const failed = stats.unexpected;
  const skipped = stats.skipped;
  const warnings = logs.filter((l) => l.result === 'warning').length;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  const responseTimes = logs.map((l) => effectiveResponseTime(l, 0)).filter((t) => t > 0);
  const avgResponseTime =
    responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(0)
      : '0';

  const sortedByTime = [...logs].sort(
    (a, b) => effectiveResponseTime(a, 0) - effectiveResponseTime(b, 0),
  );
  const fastest = sortedByTime[0];
  const slowest = sortedByTime[sortedByTime.length - 1];

  const endpointRows = buildEndpointRows(pwResults, logs);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Test Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1117; color: #e1e4e8; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 1.8rem; margin-bottom: 8px; color: #fff; }
    .subtitle { color: #8b949e; margin-bottom: 32px; }
    .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .tile { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px; text-align: center; }
    .tile .value { font-size: 2rem; font-weight: 700; }
    .tile .label { color: #8b949e; font-size: 0.85rem; margin-top: 4px; }
    .passed .value { color: #3fb950; }
    .failed .value { color: #f85149; }
    .skipped .value { color: #d29922; }
    .warning .value { color: #d29922; }
    .info .value { color: #58a6ff; }
    .progress-bar { background: #21262d; border-radius: 8px; height: 8px; margin: 16px 0 32px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #238636, #3fb950); border-radius: 8px; transition: width 0.3s; }
    .section { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .section h2 { font-size: 1.2rem; margin-bottom: 16px; color: #fff; }
    details { border: 1px solid #30363d; border-radius: 8px; margin-bottom: 8px; }
    summary { padding: 12px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    summary:hover { background: #21262d; }
    .badge { padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
    .badge-pass { background: #23863633; color: #3fb950; }
    .badge-fail { background: #da363333; color: #f85149; }
    .badge-warn { background: #9e6a0333; color: #d29922; }
    .badge-status { background: #1f6feb33; color: #58a6ff; }
    .scenario { font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
    .test-title { flex: 1; min-width: 200px; }
    .summary-meta { margin-left: auto; display: flex; align-items: center; gap: 12px; color: #8b949e; font-size: 0.85rem; white-space: nowrap; }
    .detail-body { padding: 16px; border-top: 1px solid #30363d; font-size: 0.85rem; }
    pre { background: #0d1117; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; margin-top: 8px; }
    .metric-row { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 12px; }
    .metric { color: #8b949e; }
    .metric strong { color: #e1e4e8; }
    .resolved-endpoint { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #79c0ff; margin-bottom: 12px; }
    @media (max-width: 600px) { .dashboard { grid-template-columns: repeat(2, 1fr); } .summary-meta { margin-left: 0; width: 100%; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>API Test Report</h1>
    <p class="subtitle">FakeRESTApi Automation Suite &mdash; ${new Date().toLocaleString()}</p>

    <div class="dashboard">
      <div class="tile info"><div class="value">${total}</div><div class="label">Total Tests</div></div>
      <div class="tile passed"><div class="value">${passed}</div><div class="label">Passed</div></div>
      <div class="tile failed"><div class="value">${failed}</div><div class="label">Failed</div></div>
      <div class="tile skipped"><div class="value">${skipped}</div><div class="label">Skipped</div></div>
      <div class="tile warning"><div class="value">${warnings}</div><div class="label">Warnings</div></div>
      <div class="tile info"><div class="value">${successRate}%</div><div class="label">Success Rate</div></div>
      <div class="tile info"><div class="value">${avgResponseTime}ms</div><div class="label">Avg Response Time</div></div>
      <div class="tile info"><div class="value">${(stats.duration / 1000).toFixed(1)}s</div><div class="label">Total Execution</div></div>
    </div>

    <div class="progress-bar"><div class="progress-fill" style="width: ${successRate}%"></div></div>

    <div class="section">
      <h2>Performance Summary</h2>
      <div class="metric-row">
        <div class="metric">Fastest: <strong>${fastest ? `${fastest.resolvedEndpoint ?? `${fastest.method} ${fastest.url}`} (${effectiveResponseTime(fastest, 0)}ms)` : 'N/A'}</strong></div>
        <div class="metric">Slowest: <strong>${slowest ? `${slowest.resolvedEndpoint ?? `${slowest.method} ${slowest.url}`} (${effectiveResponseTime(slowest, 0)}ms)` : 'N/A'}</strong></div>
      </div>
    </div>

    <div class="section">
      <h2>Endpoint Results</h2>
      ${endpointRows}
    </div>
  </div>
</body>
</html>`;
}

function effectiveResponseTime(log: LogEntry | undefined, fallback: number): number {
  if (!log) return fallback;
  return log.responseTimeMs > 0 ? log.responseTimeMs : fallback;
}

function matchLogToSpec(specTitle: string, logs: LogEntry[], usedIndices: Set<number>): LogEntry | undefined {
  const exactIndex = logs.findIndex(
    (l, i) => !usedIndices.has(i) && (l.testTitle === specTitle || l.testTitle?.trim() === specTitle.trim()),
  );
  if (exactIndex >= 0) {
    usedIndices.add(exactIndex);
    return logs[exactIndex];
  }

  const fuzzyIndex = logs.findIndex((l, i) => {
    if (usedIndices.has(i)) return false;
    const method = l.method;
    const endpointPrefix = l.endpoint.split('{')[0];
    return specTitle.startsWith(`${method} ${endpointPrefix}`) || specTitle.includes(`${method} ${l.endpoint}`);
  });
  if (fuzzyIndex >= 0) {
    usedIndices.add(fuzzyIndex);
    return logs[fuzzyIndex];
  }

  return undefined;
}

function buildEndpointRows(results: PlaywrightResult, logs: LogEntry[]): string {
  const specs: EndpointRow[] = [];
  const usedLogIndices = new Set<number>();

  function walkSuites(suites: PlaywrightSuite[] | undefined, controller = '') {
    if (!suites) return;
    for (const suite of suites) {
      const ctrl = suite.title.includes('Controller') ? suite.title.replace(' Controller', '') : controller;
      if (suite.specs) {
        for (const spec of suite.specs) {
          const result = spec.tests?.[0]?.results?.[0];
          const log = matchLogToSpec(spec.title, logs, usedLogIndices);
          specs.push({
            title: spec.title,
            ok: spec.ok,
            duration: result?.duration ?? 0,
            error: result?.error?.message,
            controller: ctrl,
            log,
          });
        }
      }
      walkSuites(suite.suites, ctrl);
    }
  }

  walkSuites(results.suites);

  return specs
    .map((spec) => {
      const log = spec.log;
      const scenarioType = log?.scenarioType ?? inferScenarioFromTitle(spec.title);
      const scenarioColor = SCENARIO_COLORS[scenarioType];
      const statusCode = log?.statusCode ?? '—';
      const responseTime = effectiveResponseTime(log, spec.duration);
      const badgeClass = spec.ok ? 'badge-pass' : 'badge-fail';
      const badgeText = spec.ok ? 'PASSED' : 'FAILED';

      const logDetail = log
        ? `<div class="resolved-endpoint">${escapeHtml(log.resolvedEndpoint)}</div>
          <div class="metric-row">
            <div class="metric">Controller: <strong>${escapeHtml(spec.controller)}</strong></div>
            <div class="metric">Scenario: <strong style="color:${scenarioColor}">[${scenarioType}]</strong></div>
            <div class="metric">Status Code: <strong>${log.statusCode}</strong></div>
            <div class="metric">Response Time: <strong>${responseTime}ms</strong></div>
          </div>
          <div class="metric-row">
            <div class="metric">Test Data: <strong>${escapeHtml(log.testDataInfo)}</strong></div>
          </div>
          <p><strong>Request Body:</strong></p><pre>${escapeHtml(JSON.stringify(log.requestPayload ?? {}, null, 2))}</pre>
          <p><strong>Response Body:</strong></p><pre>${escapeHtml(JSON.stringify(log.responsePayload ?? {}, null, 2).slice(0, 2000))}</pre>`
        : `<div class="metric-row"><div class="metric">No request log captured for this test.</div></div>`;

      const errorDetail = spec.error
        ? `<p style="color:#f85149"><strong>Failure:</strong> ${escapeHtml(spec.error)}</p>`
        : '';

      return `<details>
        <summary>
          <span class="badge ${badgeClass}">${badgeText}</span>
          <span class="test-title">${escapeHtml(spec.title)} <span class="scenario" style="color:${scenarioColor}">[${scenarioType}]</span></span>
          <span class="badge badge-status">${statusCode}</span>
          <span class="summary-meta">${responseTime}ms</span>
        </summary>
        <div class="detail-body">
          ${errorDetail}
          ${logDetail}
        </div>
      </details>`;
    })
    .join('\n');
}

function inferScenarioFromTitle(title: string): ScenarioType {
  const lower = title.toLowerCase();
  if (lower.includes('injection') || lower.includes('xss') || lower.includes('sql')) return 'SECURITY';
  if (lower.includes('invalid') || lower.includes('non-existing') || lower.includes('duplicate')) return 'NEGATIVE';
  if (lower.includes('boundary')) return 'BOUNDARY';
  return 'POSITIVE';
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function writeHtmlReport(outputPath?: string): void {
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const filePath = outputPath ?? path.join(reportsDir, 'api-test-report.html');
  fs.writeFileSync(filePath, generateHtmlReport());
  console.log(`HTML report written to ${filePath}`);
}
