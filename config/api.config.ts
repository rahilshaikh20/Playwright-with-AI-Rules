export const apiConfig = {
  baseUrl: 'https://fakerestapi.azurewebsites.net',
  swaggerUrl: 'https://fakerestapi.azurewebsites.net/swagger/v1/swagger.json',
  timeout: 30000,
  retries: 2,
  performanceThresholds: {
    GET: 2000,
    POST: 3000,
    PUT: 3000,
    DELETE: 3000,
  },
} as const;
