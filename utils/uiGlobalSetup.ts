import { writeAllureEnvironment } from './allureEnv';

async function uiGlobalSetup(): Promise<void> {
  writeAllureEnvironment();
}

export default uiGlobalSetup;
