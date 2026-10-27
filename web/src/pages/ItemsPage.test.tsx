import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeItem, renderWithProviders, signIn } from '../app/testUtils';
import { ITEMS } from '../graphql/documents';
import { ItemsPage } from './ItemsPage';

const all = [
  makeItem({ id: '1', name: 'Black wallet' }),
  makeItem({ id: '2', name: 'Blue umbrella', category: 'OTHER' }),
  makeItem({ id: '3', name: 'Laptop', status: 'RETURNED' }),
  makeItem({ id: '4', name: 'House keys', status: 'RETURNED' }),
];
const returned = all.filter((item) => item.status === 'RETURNED');

function itemsMock(variables: Record<string, string>, items: ReturnType<typeof makeItem>[]) {
  return { request: { query: ITEMS, variables }, result: { data: { items } } };
}

const rows = () => screen.getAllByRole('row').slice(1); // minus the header row

describe('ItemsPage', () => {
  beforeEach(signIn);

  it('filters by status and keeps it in the URL', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemsPage />, {
      route: '/items',
      path: '/items',
      mocks: [itemsMock({}, all), itemsMock({ status: 'RETURNED' }, returned)],
    });
    expect(await screen.findByText('4 items')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Status'), 'RETURNED');

    expect(await screen.findByText('2 items')).toBeInTheDocument();
    expect(rows()).toHaveLength(2);
    expect(screen.getByTestId('location')).toHaveTextContent('/items?status=RETURNED');
  });

  it('searches after the user stops typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemsPage />, {
      route: '/items',
      path: '/items',
      mocks: [itemsMock({}, all), itemsMock({ search: 'umbrella' }, [all[1]])],
    });
    await screen.findByText('4 items');

    await user.type(screen.getByLabelText('Search'), 'umbrella');

    expect(await screen.findByText('1 item')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Blue umbrella' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/items?q=umbrella');
  });

  it('shows an empty state when nothing matches', async () => {
    renderWithProviders(<ItemsPage />, {
      route: '/items?status=CLAIMED',
      path: '/items',
      mocks: [itemsMock({ status: 'CLAIMED' }, [])],
    });
    expect(await screen.findByText('No items match your filters.')).toBeInTheDocument();
  });
});
