import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[] | null | undefined;
}

export function validateSchema(
  data: unknown,
  schema: Record<string, unknown>,
): ValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid: !!valid, errors: validate.errors };
}

export function assertSchema(
  data: unknown,
  schema: Record<string, unknown>,
  label = 'response',
): void {
  const result = validateSchema(data, schema);
  if (!result.valid) {
    const messages = result.errors?.map((e) => `${e.instancePath} ${e.message}`).join('; ');
    throw new Error(`Schema validation failed for ${label}: ${messages}`);
  }
}

export function validateArrayItems(
  data: unknown[],
  itemSchema: Record<string, unknown>,
): ValidationResult {
  const errors: ErrorObject[] = [];
  for (let i = 0; i < data.length; i++) {
    const result = validateSchema(data[i], itemSchema);
    if (!result.valid && result.errors) {
      errors.push(...result.errors.map((e) => ({ ...e, instancePath: `[${i}]${e.instancePath}` })));
    }
  }
  return { valid: errors.length === 0, errors: errors.length ? errors : null };
}
