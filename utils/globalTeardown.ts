import { writeHtmlReport } from './reportHelper';

async function globalTeardown(): Promise<void> {
  writeHtmlReport();
}

export default globalTeardown;
