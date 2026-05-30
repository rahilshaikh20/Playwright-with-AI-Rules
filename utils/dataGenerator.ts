let counter = 0;

export function uniqueId(prefix = 'test'): number {
  counter += 1;
  return 100000 + (counter % 900000);
}

export function uniqueString(prefix = 'test'): string {
  return `${prefix}_${Date.now()}_${++counter}`;
}

export function generateActivity(overrides: Record<string, unknown> = {}) {
  return {
    id: uniqueId(),
    title: uniqueString('activity'),
    dueDate: new Date().toISOString(),
    completed: false,
    ...overrides,
  };
}

export function generateAuthor(overrides: Record<string, unknown> = {}) {
  return {
    id: uniqueId(),
    idBook: 1,
    firstName: uniqueString('first'),
    lastName: uniqueString('last'),
    ...overrides,
  };
}

export function generateBook(overrides: Record<string, unknown> = {}) {
  return {
    id: uniqueId(),
    title: uniqueString('book'),
    description: 'Test book description',
    pageCount: 100,
    excerpt: 'Test excerpt',
    publishDate: new Date().toISOString(),
    ...overrides,
  };
}

export function generateCoverPhoto(overrides: Record<string, unknown> = {}) {
  return {
    id: uniqueId(),
    idBook: 1,
    url: 'https://example.com/cover.jpg',
    ...overrides,
  };
}

export function generateUser(overrides: Record<string, unknown> = {}) {
  return {
    id: uniqueId(),
    userName: uniqueString('user'),
    password: 'TestPass123!',
    ...overrides,
  };
}

export const injectionPayloads = {
  xss: '<script>alert("xss")</script>',
  sqli: "' OR 1=1; DROP TABLE users; --",
};
