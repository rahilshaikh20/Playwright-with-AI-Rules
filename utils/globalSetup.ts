import { clearLogs } from './logger';

async function globalSetup(): Promise<void> {
  clearLogs();
}

export default globalSetup;
