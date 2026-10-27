import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { sessionStore } from '../auth/session';
import { isUnauthenticated } from '../graphql/errors';
import { GRAPHQL_URL } from './config';

const authLink = new SetContextLink((prevContext) => {
  const token = sessionStore.getToken();
  if (!token) return {};
  return { headers: { ...prevContext.headers, Authorization: `Bearer ${token}` } };
});

// An expired or invalid token clears the session; ProtectedRoute then redirects to /login.
const errorLink = new ErrorLink(({ error, operation }) => {
  if (operation.operationName !== 'Login' && isUnauthenticated(error)) {
    sessionStore.clear();
  }
});

export function createApolloClient() {
  return new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, new HttpLink({ uri: GRAPHQL_URL })]),
    cache: new InMemoryCache(),
  });
}
