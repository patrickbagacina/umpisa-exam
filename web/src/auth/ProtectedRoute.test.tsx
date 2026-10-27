import { act, screen } from '@testing-library/react';
import { Route } from 'react-router';
import { renderWithProviders, signIn } from '../app/testUtils';
import { ProtectedRoute } from './ProtectedRoute';
import { sessionStore } from './session';

function renderProtected() {
  return renderWithProviders(<h1>Home</h1>, {
    route: '/items?status=CLAIMED',
    path: '/',
    routes: (
      <>
        <Route element={<ProtectedRoute />}>
          <Route path="/items" element={<h1>Items</h1>} />
        </Route>
        <Route path="/login" element={<h1>Login</h1>} />
      </>
    ),
  });
}

describe('ProtectedRoute', () => {
  it('redirects to /login without a session', () => {
    renderProtected();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('renders the protected page with a session', () => {
    signIn();
    renderProtected();
    expect(screen.getByRole('heading', { name: 'Items' })).toBeInTheDocument();
  });

  it('redirects once the session is cleared (logout or UNAUTHENTICATED)', () => {
    signIn();
    renderProtected();
    act(() => sessionStore.clear());
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });
});
