export const urls = {
  baseUrl: 'https://practicetestautomation.com',
  login: '/practice-test-login/',
  loggedInSuccess: '/logged-in-successfully/',
} as const;

export function loginUrl(): string {
  return `${urls.baseUrl}${urls.login}`;
}

export function loggedInSuccessUrl(): string {
  return `${urls.baseUrl}${urls.loggedInSuccess}`;
}
