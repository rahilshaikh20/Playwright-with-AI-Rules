export const authConfig = {
  token: process.env.API_AUTH_TOKEN ?? '',
  headers: {
    Authorization: process.env.API_AUTH_TOKEN ? `Bearer ${process.env.API_AUTH_TOKEN}` : '',
  },
} as const;
