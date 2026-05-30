import { test, expect } from '@playwright/test';
import { ActivitiesClient } from '../../apiClients/ActivitiesClient';
import activitySchema from '../../schemas/Activities.schema.json';
import testData from '../../testData/Activities/Activities_testData.json';
import { generateActivity, injectionPayloads } from '../../utils/dataGenerator';
import { validateApiResponse } from '../../utils/testHelpers';

test.describe('Activities Controller', () => {
  let client: ActivitiesClient;

  test.beforeEach(({ request }) => {
    client = new ActivitiesClient(request);
  });

  test('GET /api/v1/Activities - get all activities', async () => {
    const response = await client.getAll();
    const { body } = await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities', method: 'GET', url: '/api/v1/Activities' },
      response,
      { isArray: true, itemSchema: activitySchema as Record<string, unknown> },
    );
    expect(Array.isArray(body)).toBe(true);
    expect((body as unknown[]).length).toBeGreaterThan(0);
  });

  test('GET /api/v1/Activities/{id} - get activity by valid ID', async () => {
    const listResponse = await client.getAll();
    const list = (await listResponse.json()) as { id: number }[];
    const id = list[0].id;
    const response = await client.getById(id);
    const { body } = await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities/{id}', method: 'GET', url: `/api/v1/Activities/${id}` },
      response,
      { schema: activitySchema as Record<string, unknown> },
    );
    expect((body as { id: number }).id).toBe(id);
  });

  test('GET /api/v1/Activities/{id} - get non-existing ID', async () => {
    const response = await client.getById(testData.nonExistingId);
    await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities/{id}', method: 'GET', url: `/api/v1/Activities/${testData.nonExistingId}` },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('GET /api/v1/Activities/{id} - get invalid ID', async () => {
    const response = await client.getById(testData.invalidId);
    await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities/{id}', method: 'GET', url: `/api/v1/Activities/${testData.invalidId}` },
      response,
      { expectedStatus: [400, 404] },
    );
  });

  test('POST /api/v1/Activities - create activity successfully', async () => {
    const payload = { ...testData.validActivity, ...generateActivity() };
    const response = await client.create(payload);
    const { body } = await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities', method: 'POST', url: '/api/v1/Activities', requestPayload: payload },
      response,
      { schema: activitySchema as Record<string, unknown> },
    );
    expect(body).toBeTruthy();
  });

  test('POST /api/v1/Activities - create with invalid payload', async () => {
    const response = await client.create(testData.invalidActivity);
    await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities', method: 'POST', url: '/api/v1/Activities', requestPayload: testData.invalidActivity },
      response,
      { expectedStatus: [200, 400, 422] },
    );
  });

  test('POST /api/v1/Activities - create with injection payload', async () => {
    const payload = generateActivity({ title: injectionPayloads.xss });
    const response = await client.create(payload);
    await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities', method: 'POST', url: '/api/v1/Activities', requestPayload: payload },
      response,
      { expectedStatus: [200, 400] },
    );
  });

  test('PUT /api/v1/Activities/{id} - update activity successfully', async () => {
    const createPayload = generateActivity(testData.validActivity);
    const createResponse = await client.create(createPayload);
    const created = (await createResponse.json()) as { id: number };
    const updatePayload = { ...created, title: 'Updated Activity Title', completed: true };
    const response = await client.update(created.id, updatePayload);
    const { body } = await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities/{id}', method: 'PUT', url: `/api/v1/Activities/${created.id}`, requestPayload: updatePayload },
      response,
      { schema: activitySchema as Record<string, unknown> },
    );
    expect((body as { title: string }).title).toBe('Updated Activity Title');
  });

  test('PUT /api/v1/Activities/{id} - update non-existing resource', async () => {
    const payload = generateActivity({ id: testData.nonExistingId });
    const response = await client.update(testData.nonExistingId, payload);
    await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities/{id}', method: 'PUT', url: `/api/v1/Activities/${testData.nonExistingId}`, requestPayload: payload },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('DELETE /api/v1/Activities/{id} - delete activity successfully', async () => {
    const createPayload = generateActivity(testData.validActivity);
    const createResponse = await client.create(createPayload);
    const created = (await createResponse.json()) as { id: number };
    const response = await client.remove(created.id);
    await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities/{id}', method: 'DELETE', url: `/api/v1/Activities/${created.id}` },
      response,
    );
  });

  test('DELETE /api/v1/Activities/{id} - delete invalid ID', async () => {
    const response = await client.remove(testData.invalidId);
    await validateApiResponse(
      { controller: 'Activities', endpoint: '/api/v1/Activities/{id}', method: 'DELETE', url: `/api/v1/Activities/${testData.invalidId}` },
      response,
      { expectedStatus: [200, 400, 404] },
    );
  });
});
