import { APIRequestContext } from '@playwright/test';
import { BaseClient } from './BaseClient';

export class BooksClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  getAll() {
    return this.get('/api/v1/Books');
  }

  getById(id: number | string) {
    return this.get(`/api/v1/Books/${id}`);
  }

  create(data: unknown) {
    return this.post('/api/v1/Books', data);
  }

  update(id: number | string, data: unknown) {
    return this.put(`/api/v1/Books/${id}`, data);
  }

  remove(id: number | string) {
    return this.delete(`/api/v1/Books/${id}`);
  }
}
