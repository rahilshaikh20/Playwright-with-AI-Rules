import { test, expect } from '@playwright/test';
import { AuthorsClient } from '../../apiClients/AuthorsClient';
import authorSchema from '../../schemas/Authors.schema.json';
import testData from '../../testData/Authors/Authors_testData.json';
import { generateAuthor, injectionPayloads } from '../../utils/dataGenerator';
import { validateApiResponse } from '../../utils/testHelpers';

test.describe('Authors Controller', () => {
  let client: AuthorsClient;

  test.beforeEach(({ request }) => {
    client = new AuthorsClient(request);
  });

  test('GET /api/v1/Authors - get all authors', async () => {
    const response = await client.getAll();
    const { body } = await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors', method: 'GET', url: '/api/v1/Authors' },
      response,
      { isArray: true, itemSchema: authorSchema as Record<string, unknown> },
    );
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/v1/Authors/{id} - get author by valid ID', async () => {
    const list = (await (await client.getAll()).json()) as { id: number }[];
    const id = list[0].id;
    const response = await client.getById(id);
    const { body } = await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors/{id}', method: 'GET', url: `/api/v1/Authors/${id}` },
      response,
      { schema: authorSchema as Record<string, unknown> },
    );
    expect((body as { id: number }).id).toBe(id);
  });

  test('GET /api/v1/Authors/authors/books/{idBook} - get authors by book ID', async () => {
    const response = await client.getByBookId(testData.bookIdForLookup);
    await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors/authors/books/{idBook}', method: 'GET', url: `/api/v1/Authors/authors/books/${testData.bookIdForLookup}` },
      response,
      { isArray: true, itemSchema: authorSchema as Record<string, unknown> },
    );
  });

  test('GET /api/v1/Authors/{id} - get non-existing ID', async () => {
    const response = await client.getById(testData.nonExistingId);
    await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors/{id}', method: 'GET', url: `/api/v1/Authors/${testData.nonExistingId}` },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('GET /api/v1/Authors/{id} - get invalid ID', async () => {
    const response = await client.getById(testData.invalidId);
    await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors/{id}', method: 'GET', url: `/api/v1/Authors/${testData.invalidId}` },
      response,
      { expectedStatus: [400, 404] },
    );
  });

  test('POST /api/v1/Authors - create author successfully', async () => {
    const payload = generateAuthor(testData.validAuthor);
    const response = await client.create(payload);
    const { body } = await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors', method: 'POST', url: '/api/v1/Authors', requestPayload: payload },
      response,
      { schema: authorSchema as Record<string, unknown> },
    );
    expect(body).toBeTruthy();
  });

  test('POST /api/v1/Authors - create with invalid payload', async () => {
    const response = await client.create(testData.invalidAuthor);
    await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors', method: 'POST', url: '/api/v1/Authors', requestPayload: testData.invalidAuthor },
      response,
      { expectedStatus: [200, 400, 422] },
    );
  });

  test('POST /api/v1/Authors - create with SQL injection payload', async () => {
    const payload = generateAuthor({ firstName: injectionPayloads.sqli });
    const response = await client.create(payload);
    await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors', method: 'POST', url: '/api/v1/Authors', requestPayload: payload },
      response,
      { expectedStatus: [200, 400] },
    );
  });

  test('PUT /api/v1/Authors/{id} - update author successfully', async () => {
    const created = (await (await client.create(generateAuthor(testData.validAuthor))).json()) as { id: number };
    const updatePayload = { ...created, firstName: 'Updated', lastName: 'Author' };
    const response = await client.update(created.id, updatePayload);
    const { body } = await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors/{id}', method: 'PUT', url: `/api/v1/Authors/${created.id}`, requestPayload: updatePayload },
      response,
      { schema: authorSchema as Record<string, unknown> },
    );
    expect((body as { firstName: string }).firstName).toBe('Updated');
  });

  test('PUT /api/v1/Authors/{id} - update non-existing resource', async () => {
    const payload = generateAuthor({ id: testData.nonExistingId });
    const response = await client.update(testData.nonExistingId, payload);
    await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors/{id}', method: 'PUT', url: `/api/v1/Authors/${testData.nonExistingId}`, requestPayload: payload },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('DELETE /api/v1/Authors/{id} - delete author successfully', async () => {
    const created = (await (await client.create(generateAuthor(testData.validAuthor))).json()) as { id: number };
    const response = await client.remove(created.id);
    await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors/{id}', method: 'DELETE', url: `/api/v1/Authors/${created.id}` },
      response,
    );
  });

  test('DELETE /api/v1/Authors/{id} - delete invalid ID', async () => {
    const response = await client.remove(testData.invalidId);
    await validateApiResponse(
      { controller: 'Authors', endpoint: '/api/v1/Authors/{id}', method: 'DELETE', url: `/api/v1/Authors/${testData.invalidId}` },
      response,
      { expectedStatus: [200, 400, 404] },
    );
  });
});
