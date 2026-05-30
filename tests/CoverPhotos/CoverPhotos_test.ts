import { test, expect } from '@playwright/test';
import { CoverPhotosClient } from '../../apiClients/CoverPhotosClient';
import coverPhotoSchema from '../../schemas/CoverPhotos.schema.json';
import testData from '../../testData/CoverPhotos/CoverPhotos_testData.json';
import { generateCoverPhoto } from '../../utils/dataGenerator';
import { validateApiResponse } from '../../utils/testHelpers';

test.describe('CoverPhotos Controller', () => {
  let client: CoverPhotosClient;

  test.beforeEach(({ request }) => {
    client = new CoverPhotosClient(request);
  });

  test('GET /api/v1/CoverPhotos - get all cover photos', async () => {
    const response = await client.getAll();
    const { body } = await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos', method: 'GET', url: '/api/v1/CoverPhotos' },
      response,
      { isArray: true, itemSchema: coverPhotoSchema as Record<string, unknown> },
    );
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/v1/CoverPhotos/{id} - get cover photo by valid ID', async () => {
    const list = (await (await client.getAll()).json()) as { id: number }[];
    const id = list[0].id;
    const response = await client.getById(id);
    const { body } = await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos/{id}', method: 'GET', url: `/api/v1/CoverPhotos/${id}` },
      response,
      { schema: coverPhotoSchema as Record<string, unknown> },
    );
    expect((body as { id: number }).id).toBe(id);
  });

  test('GET /api/v1/CoverPhotos/books/covers/{idBook} - get covers by book ID', async () => {
    const response = await client.getByBookId(testData.bookIdForLookup);
    await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos/books/covers/{idBook}', method: 'GET', url: `/api/v1/CoverPhotos/books/covers/${testData.bookIdForLookup}` },
      response,
      { isArray: true, itemSchema: coverPhotoSchema as Record<string, unknown> },
    );
  });

  test('GET /api/v1/CoverPhotos/{id} - get non-existing ID', async () => {
    const response = await client.getById(testData.nonExistingId);
    await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos/{id}', method: 'GET', url: `/api/v1/CoverPhotos/${testData.nonExistingId}` },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('GET /api/v1/CoverPhotos/{id} - get invalid ID', async () => {
    const response = await client.getById(testData.invalidId);
    await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos/{id}', method: 'GET', url: `/api/v1/CoverPhotos/${testData.invalidId}` },
      response,
      { expectedStatus: [400, 404] },
    );
  });

  test('POST /api/v1/CoverPhotos - create cover photo successfully', async () => {
    const payload = generateCoverPhoto(testData.validCoverPhoto);
    const response = await client.create(payload);
    const { body } = await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos', method: 'POST', url: '/api/v1/CoverPhotos', requestPayload: payload },
      response,
      { schema: coverPhotoSchema as Record<string, unknown> },
    );
    expect(body).toBeTruthy();
  });

  test('POST /api/v1/CoverPhotos - create with invalid payload', async () => {
    const response = await client.create(testData.invalidCoverPhoto);
    await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos', method: 'POST', url: '/api/v1/CoverPhotos', requestPayload: testData.invalidCoverPhoto },
      response,
      { expectedStatus: [200, 400, 422] },
    );
  });

  test('PUT /api/v1/CoverPhotos/{id} - update cover photo successfully', async () => {
    const created = (await (await client.create(generateCoverPhoto(testData.validCoverPhoto))).json()) as { id: number };
    const updatePayload = { ...created, url: 'https://example.com/updated-cover.jpg' };
    const response = await client.update(created.id, updatePayload);
    const { body } = await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos/{id}', method: 'PUT', url: `/api/v1/CoverPhotos/${created.id}`, requestPayload: updatePayload },
      response,
      { schema: coverPhotoSchema as Record<string, unknown> },
    );
    expect((body as { url: string }).url).toContain('updated-cover');
  });

  test('PUT /api/v1/CoverPhotos/{id} - update non-existing resource', async () => {
    const payload = generateCoverPhoto({ id: testData.nonExistingId });
    const response = await client.update(testData.nonExistingId, payload);
    await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos/{id}', method: 'PUT', url: `/api/v1/CoverPhotos/${testData.nonExistingId}`, requestPayload: payload },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('DELETE /api/v1/CoverPhotos/{id} - delete cover photo successfully', async () => {
    const created = (await (await client.create(generateCoverPhoto(testData.validCoverPhoto))).json()) as { id: number };
    const response = await client.remove(created.id);
    await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos/{id}', method: 'DELETE', url: `/api/v1/CoverPhotos/${created.id}` },
      response,
    );
  });

  test('DELETE /api/v1/CoverPhotos/{id} - delete invalid ID', async () => {
    const response = await client.remove(testData.invalidId);
    await validateApiResponse(
      { controller: 'CoverPhotos', endpoint: '/api/v1/CoverPhotos/{id}', method: 'DELETE', url: `/api/v1/CoverPhotos/${testData.invalidId}` },
      response,
      { expectedStatus: [200, 400, 404] },
    );
  });
});
