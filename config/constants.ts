export const constants = {
  timeout: {
    default: 30000,
    navigation: 30000,
    action: 10000,
  },
  retries: process.env.CI ? 2 : 1,
  browser: process.env.BROWSER ?? 'chromium',
} as const;
