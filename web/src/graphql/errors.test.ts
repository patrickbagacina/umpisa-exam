import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { getErrorMessage, hasErrorCode, isUnauthenticated } from './errors';

function graphQLErrors(...errors: { message: string; extensions?: Record<string, unknown> }[]) {
  return new CombinedGraphQLErrors({ data: null, errors });
}

describe('graphql error helpers', () => {
  it('detects UNAUTHENTICATED GraphQL errors and HTTP 401', () => {
    expect(
      isUnauthenticated(graphQLErrors({ message: 'no', extensions: { code: 'UNAUTHENTICATED' } })),
    ).toBe(true);
    expect(
      isUnauthenticated(
        new ServerError('401', { response: new Response(null, { status: 401 }), bodyText: '' }),
      ),
    ).toBe(true);
    expect(
      isUnauthenticated(graphQLErrors({ message: 'x', extensions: { code: 'BAD_USER_INPUT' } })),
    ).toBe(false);
    expect(isUnauthenticated(new Error('offline'))).toBe(false);
  });

  it('matches error codes', () => {
    const error = graphQLErrors({ message: 'Item not found', extensions: { code: 'NOT_FOUND' } });
    expect(hasErrorCode(error, 'NOT_FOUND')).toBe(true);
    expect(hasErrorCode(error, 'BAD_USER_INPUT')).toBe(false);
  });

  it('builds readable messages', () => {
    expect(
      getErrorMessage(
        graphQLErrors(
          { message: 'name must be longer than or equal to 2 characters' },
          { message: 'Item not found' },
        ),
      ),
    ).toBe('name must be longer than or equal to 2 characters. Item not found');
    expect(
      getErrorMessage(graphQLErrors({ message: 'Cannot return an item that is UNCLAIMED' })),
    ).toBe('Cannot return an item that is UNCLAIMED');
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toBe(
      'Cannot reach the server. Please try again.',
    );
  });
});
