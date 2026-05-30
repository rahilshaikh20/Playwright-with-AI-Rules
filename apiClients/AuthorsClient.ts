import { APIRequestContext } from '@playwright/test';
import { BaseClient } from './BaseClient';

export class AuthorsClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  getAll() {
    return this.get('/api/v1/Authors');
  }

  getById(id: number | string) {
    return this.get(`/api/v1/Authors/${id}`);
  }

  getByBookId(idBook: number | string) {
    return this.get(`/api/v1/Authors/authors/books/${idBook}`);
  }

  create(data: unknown) {
    return this.post('/api/v1/Authors', data);
  }

  update(id: number | string, data: unknown) {
    return this.put(`/api/v1/Authors/${id}`, data);
  }

  remove(id: number | string) {
    return this.delete(`/api/v1/Authors/${id}`);
  }
}
