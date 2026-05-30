import { APIRequestContext } from '@playwright/test';
import { BaseClient } from './BaseClient';

export class CoverPhotosClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  getAll() {
    return this.get('/api/v1/CoverPhotos');
  }

  getById(id: number | string) {
    return this.get(`/api/v1/CoverPhotos/${id}`);
  }

  getByBookId(idBook: number | string) {
    return this.get(`/api/v1/CoverPhotos/books/covers/${idBook}`);
  }

  create(data: unknown) {
    return this.post('/api/v1/CoverPhotos', data);
  }

  update(id: number | string, data: unknown) {
    return this.put(`/api/v1/CoverPhotos/${id}`, data);
  }

  remove(id: number | string) {
    return this.delete(`/api/v1/CoverPhotos/${id}`);
  }
}
