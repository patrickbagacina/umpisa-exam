import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';

/** True when the API rejected the request because the token is missing, invalid or expired. */
export function isUnauthenticated(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED');
  }
  return ServerError.is(error) && error.statusCode === 401;
}

/** True when any GraphQL error carries the given `extensions.code`. */
export function hasErrorCode(error: unknown, code: string): boolean {
  return CombinedGraphQLErrors.is(error) && error.errors.some((e) => e.extensions?.code === code);
}

/** A readable message for an Apollo error (the API joins validation messages into `message`). */
export function getErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((e) => e.message).join('. ');
  }
  if (error instanceof Error) {
    return error.message.includes('fetch')
      ? 'Cannot reach the server. Please try again.'
      : error.message;
  }
  return 'Something went wrong.';
}
