export const env = {
  name: process.env.TEST_ENV ?? 'qa',
  headless: process.env.HEADLESS !== 'false',
  slowMo: Number(process.env.SLOW_MO ?? 0),
} as const;
