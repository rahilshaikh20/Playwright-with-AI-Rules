import { APIRequestContext } from '@playwright/test';
import { BaseClient } from './BaseClient';

export class ActivitiesClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  getAll() {
    return this.get('/api/v1/Activities');
  }

  getById(id: number | string) {
    return this.get(`/api/v1/Activities/${id}`);
  }

  create(data: unknown) {
    return this.post('/api/v1/Activities', data);
  }

  update(id: number | string, data: unknown) {
    return this.put(`/api/v1/Activities/${id}`, data);
  }

  remove(id: number | string) {
    return this.delete(`/api/v1/Activities/${id}`);
  }
}
