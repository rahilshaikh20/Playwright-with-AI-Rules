import { test, expect } from '@playwright/test';
import { BooksClient } from '../../apiClients/BooksClient';
import bookSchema from '../../schemas/Books.schema.json';
import testData from '../../testData/Books/Books_testData.json';
import { generateBook, injectionPayloads } from '../../utils/dataGenerator';
import { validateApiResponse } from '../../utils/testHelpers';

test.describe('Books Controller', () => {
  let client: BooksClient;

  test.beforeEach(({ request }) => {
    client = new BooksClient(request);
  });

  test('GET /api/v1/Books - get all books', async () => {
    const response = await client.getAll();
    const { body } = await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books', method: 'GET', url: '/api/v1/Books' },
      response,
      { isArray: true, itemSchema: bookSchema as Record<string, unknown> },
    );
    expect(Array.isArray(body)).toBe(true);
    expect((body as unknown[]).length).toBeGreaterThan(0);
  });

  test('GET /api/v1/Books/{id} - get book by valid ID', async () => {
    const list = (await (await client.getAll()).json()) as { id: number }[];
    const id = list[0].id;
    const response = await client.getById(id);
    const { body } = await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books/{id}', method: 'GET', url: `/api/v1/Books/${id}` },
      response,
      { schema: bookSchema as Record<string, unknown> },
    );
    expect((body as { id: number }).id).toBe(id);
  });

  test('GET /api/v1/Books/{id} - get non-existing ID', async () => {
    const response = await client.getById(testData.nonExistingId);
    await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books/{id}', method: 'GET', url: `/api/v1/Books/${testData.nonExistingId}` },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('GET /api/v1/Books/{id} - get invalid ID', async () => {
    const response = await client.getById(testData.invalidId);
    await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books/{id}', method: 'GET', url: `/api/v1/Books/${testData.invalidId}` },
      response,
      { expectedStatus: [400, 404] },
    );
  });

  test('POST /api/v1/Books - create book successfully', async () => {
    const payload = generateBook(testData.validBook);
    const response = await client.create(payload);
    await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books', method: 'POST', url: '/api/v1/Books', requestPayload: payload },
      response,
    );
  });

  test('POST /api/v1/Books - create with invalid payload', async () => {
    const response = await client.create(testData.invalidBook);
    await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books', method: 'POST', url: '/api/v1/Books', requestPayload: testData.invalidBook },
      response,
      { expectedStatus: [200, 400, 422] },
    );
  });

  test('POST /api/v1/Books - create with XSS payload', async () => {
    const payload = generateBook({ title: injectionPayloads.xss });
    const response = await client.create(payload);
    await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books', method: 'POST', url: '/api/v1/Books', requestPayload: payload },
      response,
      { expectedStatus: [200, 400] },
    );
  });

  test('PUT /api/v1/Books/{id} - update book successfully', async () => {
    const list = (await (await client.getAll()).json()) as { id: number; title: string }[];
    const book = list[0];
    const updatePayload = { ...book, title: 'Updated Book Title' };
    const response = await client.update(book.id, updatePayload);
    await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books/{id}', method: 'PUT', url: `/api/v1/Books/${book.id}`, requestPayload: updatePayload },
      response,
    );
  });

  test('PUT /api/v1/Books/{id} - update non-existing resource', async () => {
    const payload = generateBook({ id: testData.nonExistingId });
    const response = await client.update(testData.nonExistingId, payload);
    await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books/{id}', method: 'PUT', url: `/api/v1/Books/${testData.nonExistingId}`, requestPayload: payload },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('DELETE /api/v1/Books/{id} - delete book successfully', async () => {
    const payload = generateBook(testData.validBook);
    await client.create(payload);
    const list = (await (await client.getAll()).json()) as { id: number; title: string }[];
    const created = list.find((b) => b.title === payload.title);
    if (created) {
      const response = await client.remove(created.id);
      await validateApiResponse(
        { controller: 'Books', endpoint: '/api/v1/Books/{id}', method: 'DELETE', url: `/api/v1/Books/${created.id}` },
        response,
      );
    }
  });

  test('DELETE /api/v1/Books/{id} - delete invalid ID', async () => {
    const response = await client.remove(testData.invalidId);
    await validateApiResponse(
      { controller: 'Books', endpoint: '/api/v1/Books/{id}', method: 'DELETE', url: `/api/v1/Books/${testData.invalidId}` },
      response,
      { expectedStatus: [200, 400, 404] },
    );
  });
});
