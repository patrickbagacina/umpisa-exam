import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { ItemTable } from '../components/ItemTable';
import { STATUS_LABELS } from '../components/labels';
import { Loading } from '../components/Loading';
import { useDebouncedValue } from '../components/useDebouncedValue';
import { ITEMS } from '../graphql/documents';
import { getErrorMessage } from '../graphql/errors';
import { ITEM_STATUSES, type ItemStatus } from '../graphql/types';

function parseStatus(value: string | null): ItemStatus | undefined {
  return ITEM_STATUSES.find((status) => status === value);
}

export function ItemsPage() {
  const [params, setParams] = useSearchParams();
  const status = parseStatus(params.get('status'));
  const [search, setSearch] = useState(params.get('q') ?? '');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  // Keep the debounced search in the URL so going back to the list restores it.
  useEffect(() => {
    if ((params.get('q') ?? '') === debouncedSearch) return;
    const next = new URLSearchParams(params);
    if (debouncedSearch) next.set('q', debouncedSearch);
    else next.delete('q');
    setParams(next, { replace: true });
  }, [debouncedSearch, params, setParams]);

  function changeStatus(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set('status', value);
    else next.delete('status');
    setParams(next, { replace: true });
  }

  const { data, previousData, loading, error, refetch } = useQuery(ITEMS, {
    variables: {
      ...(status && { status }),
      ...(debouncedSearch && { search: debouncedSearch }),
    },
    fetchPolicy: 'cache-and-network',
  });
  const items = (data ?? previousData)?.items;
  const filtered = !!status || !!debouncedSearch;

  return (
    <>
      <div className="page-header">
        <h1>Items</h1>
        <Link to="/items/new" className="button button--primary">
          Log item
        </Link>
      </div>

      <div className="filters">
        <label className="filters__search">
          <span className="sr-only">Search</span>
          <input
            type="search"
            placeholder="Search name, description or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select value={status ?? ''} onChange={(e) => changeStatus(e.target.value)}>
            <option value="">All statuses</option>
            {ITEM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <ErrorMessage message={getErrorMessage(error)} onRetry={() => void refetch()} />}
      {loading && !items && <Loading />}
      {items &&
        (items.length === 0 ? (
          <EmptyState title={filtered ? 'No items match your filters.' : 'No items logged yet.'}>
            {!filtered && <Link to="/items/new">Log the first item</Link>}
          </EmptyState>
        ) : (
          <>
            <p className="muted small" aria-live="polite">
              {items.length} {items.length === 1 ? 'item' : 'items'}
              {loading && ' · updating…'}
            </p>
            <ItemTable items={items} />
          </>
        ))}
    </>
  );
}
