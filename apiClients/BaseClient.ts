import { APIRequestContext, APIResponse } from '@playwright/test';
import { authConfig } from '../config/auth.config';

const responseTimings = new WeakMap<APIResponse, number>();

export function getResponseTime(response: APIResponse): number | undefined {
  return responseTimings.get(response);
}

export class BaseClient {
  constructor(protected request: APIRequestContext) {}

  protected headers(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...extra,
    };
    if (authConfig.token) {
      headers.Authorization = `Bearer ${authConfig.token}`;
    }
    return headers;
  }

  private async timed<T extends APIResponse>(requestFn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    const response = await requestFn();
    responseTimings.set(response, Date.now() - start);
    return response;
  }

  protected async get(path: string, extraHeaders?: Record<string, string>) {
    return this.timed(() => this.request.get(path, { headers: this.headers(extraHeaders) }));
  }

  protected async post(path: string, data?: unknown, extraHeaders?: Record<string, string>) {
    return this.timed(() =>
      this.request.post(path, { headers: this.headers(extraHeaders), data }),
    );
  }

  protected async put(path: string, data?: unknown, extraHeaders?: Record<string, string>) {
    return this.timed(() =>
      this.request.put(path, { headers: this.headers(extraHeaders), data }),
    );
  }

  protected async delete(path: string, extraHeaders?: Record<string, string>) {
    return this.timed(() => this.request.delete(path, { headers: this.headers(extraHeaders) }));
  }
}
