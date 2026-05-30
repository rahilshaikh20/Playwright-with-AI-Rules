import { test, expect } from '@playwright/test';
import { UsersClient } from '../../apiClients/UsersClient';
import userSchema from '../../schemas/Users.schema.json';
import testData from '../../testData/Users/Users_testData.json';
import { generateUser, injectionPayloads } from '../../utils/dataGenerator';
import { validateApiResponse } from '../../utils/testHelpers';

test.describe('Users Controller', () => {
  let client: UsersClient;

  test.beforeEach(({ request }) => {
    client = new UsersClient(request);
  });

  test('GET /api/v1/Users - get all users', async () => {
    const response = await client.getAll();
    const { body } = await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users', method: 'GET', url: '/api/v1/Users' },
      response,
      { isArray: true, itemSchema: userSchema as Record<string, unknown> },
    );
    expect(Array.isArray(body)).toBe(true);
    expect((body as unknown[]).length).toBeGreaterThan(0);
  });

  test('GET /api/v1/Users/{id} - get user by valid ID', async () => {
    const list = (await (await client.getAll()).json()) as { id: number }[];
    const id = list[0].id;
    const response = await client.getById(id);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users/{id}', method: 'GET', url: `/api/v1/Users/${id}` },
      response,
    );
  });

  test('GET /api/v1/Users/{id} - get non-existing ID', async () => {
    const response = await client.getById(testData.nonExistingId);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users/{id}', method: 'GET', url: `/api/v1/Users/${testData.nonExistingId}` },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('GET /api/v1/Users/{id} - get invalid ID', async () => {
    const response = await client.getById(testData.invalidId);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users/{id}', method: 'GET', url: `/api/v1/Users/${testData.invalidId}` },
      response,
      { expectedStatus: [400, 404] },
    );
  });

  test('POST /api/v1/Users - create user successfully', async () => {
    const payload = generateUser(testData.validUser);
    const response = await client.create(payload);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users', method: 'POST', url: '/api/v1/Users', requestPayload: { userName: payload.userName } },
      response,
    );
  });

  test('POST /api/v1/Users - create with invalid payload', async () => {
    const response = await client.create(testData.invalidUser);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users', method: 'POST', url: '/api/v1/Users', requestPayload: testData.invalidUser },
      response,
      { expectedStatus: [200, 400, 422] },
    );
  });

  test('POST /api/v1/Users - create with injection payload', async () => {
    const payload = generateUser({ userName: injectionPayloads.sqli });
    const response = await client.create(payload);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users', method: 'POST', url: '/api/v1/Users', requestPayload: { userName: payload.userName } },
      response,
      { expectedStatus: [200, 400] },
    );
  });

  test('PUT /api/v1/Users/{id} - update user successfully', async () => {
    const list = (await (await client.getAll()).json()) as { id: number; userName: string; password: string }[];
    const user = list[0];
    const updatePayload = { ...user, userName: `updated_${Date.now()}` };
    const response = await client.update(user.id, updatePayload);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users/{id}', method: 'PUT', url: `/api/v1/Users/${user.id}`, requestPayload: { userName: updatePayload.userName } },
      response,
    );
  });

  test('PUT /api/v1/Users/{id} - update non-existing resource', async () => {
    const payload = generateUser({ id: testData.nonExistingId });
    const response = await client.update(testData.nonExistingId, payload);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users/{id}', method: 'PUT', url: `/api/v1/Users/${testData.nonExistingId}`, requestPayload: payload },
      response,
      { expectedStatus: [200, 404] },
    );
  });

  test('DELETE /api/v1/Users/{id} - delete user successfully', async () => {
    const payload = generateUser(testData.validUser);
    await client.create(payload);
    const list = (await (await client.getAll()).json()) as { id: number; userName: string }[];
    const created = list.find((u) => u.userName === payload.userName);
    if (created) {
      const response = await client.remove(created.id);
      await validateApiResponse(
        { controller: 'Users', endpoint: '/api/v1/Users/{id}', method: 'DELETE', url: `/api/v1/Users/${created.id}` },
        response,
      );
    }
  });

  test('DELETE /api/v1/Users/{id} - delete invalid ID', async () => {
    const response = await client.remove(testData.invalidId);
    await validateApiResponse(
      { controller: 'Users', endpoint: '/api/v1/Users/{id}', method: 'DELETE', url: `/api/v1/Users/${testData.invalidId}` },
      response,
      { expectedStatus: [200, 400, 404] },
    );
  });
});
