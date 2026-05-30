import { APIRequestContext } from '@playwright/test';
import { BaseClient } from './BaseClient';

export class UsersClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  getAll() {
    return this.get('/api/v1/Users');
  }

  getById(id: number | string) {
    return this.get(`/api/v1/Users/${id}`);
  }

  create(data: unknown) {
    return this.post('/api/v1/Users', data);
  }

  update(id: number | string, data: unknown) {
    return this.put(`/api/v1/Users/${id}`, data);
  }

  remove(id: number | string) {
    return this.delete(`/api/v1/Users/${id}`);
  }
}
