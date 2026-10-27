import { screen } from '@testing-library/react';
import { makeItem, renderWithProviders, signIn } from '../app/testUtils';
import { DASHBOARD } from '../graphql/documents';
import { DashboardPage } from './DashboardPage';

function dashboardMock(items = [makeItem()]) {
  return {
    request: { query: DASHBOARD },
    result: {
      data: {
        itemStats: { __typename: 'ItemStats', total: 8, unclaimed: 4, claimed: 2, returned: 2 },
        items,
      },
    },
  };
}

describe('DashboardPage', () => {
  beforeEach(signIn);

  it('shows counts by status and the latest items', async () => {
    renderWithProviders(<DashboardPage />, { mocks: [dashboardMock()] });

    const unclaimed = await screen.findByRole('link', { name: /Unclaimed/ });
    expect(unclaimed).toHaveTextContent('4');
    expect(unclaimed).toHaveAttribute('href', '/items?status=UNCLAIMED');
    expect(screen.getByRole('link', { name: /Claimed/ })).toHaveTextContent('2');
    expect(screen.getByRole('link', { name: /Returned/ })).toHaveTextContent('2');
    expect(screen.getByRole('link', { name: /Total items/ })).toHaveTextContent('8');
    expect(screen.getByRole('link', { name: 'Black wallet' })).toHaveAttribute('href', '/items/1');
  });

  it('shows an empty state when nothing is logged', async () => {
    renderWithProviders(<DashboardPage />, { mocks: [dashboardMock([])] });
    expect(await screen.findByText('No items logged yet.')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    renderWithProviders(<DashboardPage />, {
      mocks: [{ request: { query: DASHBOARD }, error: new Error('Network down') }],
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Network down');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
