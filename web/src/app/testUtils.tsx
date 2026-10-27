import type { MockLink } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { AuthProvider } from '../auth/AuthProvider';
import { sessionStore } from '../auth/session';
import type { Item, User } from '../graphql/types';

export const demoUser: User = { id: '1', email: 'staff@lostfound.test', name: 'Demo Staff' };

export function signIn() {
  sessionStore.set({ token: 'test-token', user: demoUser });
}

/** An Item as the API returns it, with __typename for the Apollo cache. */
export function makeItem(overrides: Partial<Item> = {}) {
  return {
    __typename: 'Item' as const,
    id: '1',
    name: 'Black wallet',
    description: 'Leather, two cards inside',
    category: 'WALLET' as const,
    locationFound: 'Lobby',
    foundAt: '2026-10-20T09:00:00.000Z',
    status: 'UNCLAIMED' as const,
    ownerName: null,
    ownerContact: null,
    claimedAt: null,
    returnedAt: null,
    createdAt: '2026-10-20T10:00:00.000Z',
    ...overrides,
    loggedBy: { __typename: 'User' as const, ...demoUser },
  };
}

/** Prints the current path so tests can assert on redirects. */
export function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

interface RenderOptions {
  mocks?: MockLink.MockedResponse[];
  /** Initial URL, e.g. `/items/1`. */
  route?: string;
  /** Route pattern the element is mounted on, e.g. `/items/:id`. */
  path?: string;
  /** Extra routes, e.g. redirect targets. */
  routes?: ReactNode;
}

export function renderWithProviders(
  element: ReactNode,
  { mocks = [], route = '/', path = '/', routes }: RenderOptions = {},
) {
  return render(
    <MockedProvider mocks={mocks}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={element} />
            {routes}
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthProvider>
    </MockedProvider>,
  );
}
