import * as fs from 'fs';
import * as path from 'path';

export interface EndpointInfo {
  controller: string;
  method: string;
  path: string;
  operationId?: string;
  hasRequestBody: boolean;
  responseSchema?: string;
}

export interface SwaggerSpec {
  paths: Record<string, Record<string, unknown>>;
  components?: { schemas?: Record<string, unknown> };
}

export class SwaggerParser {
  private spec: SwaggerSpec;

  constructor(spec: SwaggerSpec) {
    this.spec = spec;
  }

  static async fromUrl(url: string): Promise<SwaggerParser> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Swagger spec: ${response.status}`);
    }
    const spec = (await response.json()) as SwaggerSpec;
    return new SwaggerParser(spec);
  }

  static fromFile(filePath: string): SwaggerParser {
    const content = fs.readFileSync(filePath, 'utf-8');
    return new SwaggerParser(JSON.parse(content) as SwaggerSpec);
  }

  getControllers(): string[] {
    const controllers = new Set<string>();
    for (const methods of Object.values(this.spec.paths)) {
      for (const operation of Object.values(methods)) {
        const tags = (operation as { tags?: string[] }).tags;
        if (tags?.[0]) controllers.add(tags[0]);
      }
    }
    return Array.from(controllers).sort();
  }

  getEndpoints(controller?: string): EndpointInfo[] {
    const endpoints: EndpointInfo[] = [];
    for (const [pathKey, methods] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          const op = operation as {
            tags?: string[];
            requestBody?: unknown;
            responses?: Record<string, { content?: Record<string, { schema?: { items?: { $ref?: string }; $ref?: string } }> }>;
          };
          const ctrl = op.tags?.[0] ?? 'Unknown';
          if (controller && ctrl !== controller) continue;

          let responseSchema: string | undefined;
          const successResponse = op.responses?.['200'];
          const jsonContent = successResponse?.content?.['application/json; v=1.0'];
          const schemaRef = jsonContent?.schema?.$ref ?? jsonContent?.schema?.items?.$ref;
          if (schemaRef) {
            responseSchema = schemaRef.split('/').pop();
          }

          endpoints.push({
            controller: ctrl,
            method: method.toUpperCase(),
            path: pathKey,
            hasRequestBody: !!op.requestBody,
            responseSchema,
          });
        }
      }
    }
    return endpoints;
  }

  getSchema(name: string): Record<string, unknown> | undefined {
    return this.spec.components?.schemas?.[name] as Record<string, unknown> | undefined;
  }

  getAllSchemas(): Record<string, unknown> {
    return (this.spec.components?.schemas ?? {}) as Record<string, unknown>;
  }
}

export async function validateSwaggerAgainstApi(
  parser: SwaggerParser,
  baseUrl: string,
): Promise<{ endpoint: string; valid: boolean; error?: string }[]> {
  const results: { endpoint: string; valid: boolean; error?: string }[] = [];
  for (const ep of parser.getEndpoints()) {
    if (ep.method !== 'GET') continue;
    const url = `${baseUrl}${ep.path.replace(/\{[^}]+\}/g, '1')}`;
    try {
      const res = await fetch(url);
      results.push({
        endpoint: `${ep.method} ${ep.path}`,
        valid: res.ok,
        error: res.ok ? undefined : `Status ${res.status}`,
      });
    } catch (err) {
      results.push({
        endpoint: `${ep.method} ${ep.path}`,
        valid: false,
        error: String(err),
      });
    }
  }
  return results;
}

if (require.main === module) {
  void (async () => {
    const { apiConfig } = await import('../config/api.config');
    const parser = await SwaggerParser.fromUrl(apiConfig.swaggerUrl);
    console.log('Controllers:', parser.getControllers());
    console.log('Endpoints:', parser.getEndpoints().length);
  })();
}
