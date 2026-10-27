import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { makeItem, renderWithProviders, signIn } from '../app/testUtils';
import { CLAIM_ITEM, ITEM, RELEASE_CLAIM, RETURN_ITEM } from '../graphql/documents';
import type { Item } from '../graphql/types';
import { ItemDetailPage } from './ItemDetailPage';

const claimed = {
  status: 'CLAIMED' as const,
  ownerName: 'Ana Cruz',
  ownerContact: 'ana@mail.com',
  claimedAt: '2026-10-21T08:00:00.000Z',
};

function itemMock(overrides: Partial<Item> = {}) {
  return {
    request: { query: ITEM, variables: { id: '1' } },
    result: { data: { item: makeItem(overrides) } },
  };
}

function renderDetail(mocks: MockLink.MockedResponse[]) {
  signIn();
  return renderWithProviders(<ItemDetailPage />, { mocks, route: '/items/1', path: '/items/:id' });
}

const actions = () => within(screen.getByRole('region', { name: 'Actions' }));

describe('ItemDetailPage', () => {
  it('UNCLAIMED: offers only "Record claim"', async () => {
    renderDetail([itemMock()]);
    expect(await screen.findByRole('heading', { name: 'Black wallet' })).toBeInTheDocument();
    expect(screen.getByText('Unclaimed')).toBeInTheDocument();
    expect(
      actions()
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Record claim']);
  });

  it('CLAIMED: shows the owner with "Mark returned" and "Release claim"', async () => {
    renderDetail([itemMock(claimed)]);
    expect(await screen.findByText('Ana Cruz')).toBeInTheDocument();
    expect(screen.getByText('ana@mail.com')).toBeInTheDocument();
    expect(
      actions()
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Mark returned', 'Release claim']);
  });

  it('RETURNED: shows returnedAt and no action buttons', async () => {
    renderDetail([
      itemMock({ ...claimed, status: 'RETURNED', returnedAt: '2026-10-22T08:00:00.000Z' }),
    ]);
    expect(await screen.findByText('Returned on')).toBeInTheDocument();
    expect(actions().queryAllByRole('button')).toHaveLength(0);
    expect(actions().getByText(/has been returned/)).toBeInTheDocument();
  });

  it('records a claim, then marks the item returned', async () => {
    const user = userEvent.setup();
    renderDetail([
      itemMock(),
      {
        request: {
          query: CLAIM_ITEM,
          variables: { id: '1', input: { ownerName: 'Ana Cruz', ownerContact: 'ana@mail.com' } },
        },
        result: { data: { claimItem: makeItem(claimed) } },
      },
      {
        request: { query: RETURN_ITEM, variables: { id: '1' } },
        result: {
          data: {
            returnItem: makeItem({
              ...claimed,
              status: 'RETURNED',
              returnedAt: '2026-10-22T08:00:00.000Z',
            }),
          },
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Record claim' }));
    await user.click(screen.getByRole('button', { name: 'Save claim' }));
    expect(screen.getByText('Owner name is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Owner name'), 'Ana Cruz');
    await user.type(screen.getByLabelText('Owner contact'), 'ana@mail.com');
    await user.click(screen.getByRole('button', { name: 'Save claim' }));

    await user.click(await screen.findByRole('button', { name: 'Mark returned' }));
    expect(await screen.findByText('Returned on')).toBeInTheDocument();
    expect(screen.getByText('Returned')).toBeInTheDocument();
    expect(actions().queryAllByRole('button')).toHaveLength(0);
  });

  it('releases a claim back to UNCLAIMED', async () => {
    const user = userEvent.setup();
    renderDetail([
      itemMock(claimed),
      {
        request: { query: RELEASE_CLAIM, variables: { id: '1' } },
        result: { data: { releaseClaim: makeItem() } },
      },
    ]);
    await user.click(await screen.findByRole('button', { name: 'Release claim' }));
    expect(await screen.findByRole('button', { name: 'Record claim' })).toBeInTheDocument();
    expect(screen.queryByText('Ana Cruz')).not.toBeInTheDocument();
  });

  it('shows a rejected transition as an error', async () => {
    const user = userEvent.setup();
    renderDetail([
      itemMock(claimed),
      {
        request: { query: RETURN_ITEM, variables: { id: '1' } },
        result: {
          errors: [
            new GraphQLError('Cannot return an item that is UNCLAIMED', {
              extensions: { code: 'BAD_USER_INPUT' },
            }),
          ],
        },
      },
    ]);
    await user.click(await screen.findByRole('button', { name: 'Mark returned' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cannot return an item that is UNCLAIMED',
    );
  });

  it('shows "Item not found" for NOT_FOUND', async () => {
    renderDetail([
      {
        request: { query: ITEM, variables: { id: '1' } },
        result: {
          errors: [new GraphQLError('Item not found', { extensions: { code: 'NOT_FOUND' } })],
        },
      },
    ]);
    expect(await screen.findByText('Item not found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to items' })).toBeInTheDocument();
  });
});
