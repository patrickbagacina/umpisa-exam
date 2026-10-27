import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '../auth/AuthProvider';
import { createApolloClient } from './apolloClient';
import { AppRoutes } from './AppRoutes';

const client = createApolloClient();

export function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}
