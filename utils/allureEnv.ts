import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export function writeAllureEnvironment(): void {
  const dir = join(process.cwd(), 'allure-results');
  mkdirSync(dir, { recursive: true });
  const content = [
    `Browser=${process.env.BROWSER ?? 'chromium'}`,
    `Environment=${process.env.TEST_ENV ?? 'qa'}`,
    `Framework=Playwright`,
    `Application=Practice Test Automation Login`,
    `Base.URL=https://practicetestautomation.com`,
  ].join('\n');
  writeFileSync(join(dir, 'environment.properties'), content);
}
