import type { MockLink } from '@apollo/client/testing';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { Route } from 'react-router';
import { demoUser, renderWithProviders, signIn } from '../app/testUtils';
import { LOGIN } from '../graphql/documents';
import { LoginPage } from './LoginPage';
import { sessionStore } from './session';

const variables = { email: 'staff@lostfound.test', password: 'Password123!' };

function renderLogin(mocks: MockLink.MockedResponse[] = []) {
  return renderWithProviders(<LoginPage />, {
    mocks,
    route: '/login',
    path: '/login',
    routes: <Route path="/" element={<h1>Dashboard</h1>} />,
  });
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginPage', () => {
  it('shows field errors without calling the API', async () => {
    renderLogin();
    await fillAndSubmit('not-an-email', '');
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('stores the session and lands on the dashboard after a successful login', async () => {
    renderLogin([
      {
        request: { query: LOGIN, variables },
        result: {
          data: {
            login: {
              __typename: 'AuthPayload',
              accessToken: 'jwt-token',
              user: { __typename: 'User', ...demoUser },
            },
          },
        },
      },
    ]);
    await fillAndSubmit(variables.email, variables.password);

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
    expect(sessionStore.getToken()).toBe('jwt-token');
  });

  it('shows the API error for wrong credentials', async () => {
    renderLogin([
      {
        request: { query: LOGIN, variables: { ...variables, password: 'wrong' } },
        result: {
          errors: [
            new GraphQLError('Invalid email or password', {
              extensions: { code: 'UNAUTHENTICATED' },
            }),
          ],
        },
      },
    ]);
    await fillAndSubmit(variables.email, 'wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(sessionStore.get()).toBeNull();
  });

  it('redirects to the dashboard when already logged in', () => {
    signIn();
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
