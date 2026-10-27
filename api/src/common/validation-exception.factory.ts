import type { ValidationError } from 'class-validator';
import { GraphQLError } from 'graphql';

/** Flattens class-validator errors into `{ "input.name": ["..."] }`. */
export function fieldErrors(errors: ValidationError[], prefix = ''): Record<string, string[]> {
  return errors.reduce<Record<string, string[]>>((acc, error) => {
    const path = prefix + error.property;
    if (error.constraints) acc[path] = Object.values(error.constraints);
    return { ...acc, ...fieldErrors(error.children ?? [], `${path}.`) };
  }, {});
}

/** ValidationPipe errors become BAD_USER_INPUT with per-field messages in `extensions.fields`. */
export function validationExceptionFactory(errors: ValidationError[]): GraphQLError {
  const fields = fieldErrors(errors);
  return new GraphQLError(Object.values(fields).flat().join('; ') || 'Invalid input', {
    extensions: { code: 'BAD_USER_INPUT', fields },
  });
}
