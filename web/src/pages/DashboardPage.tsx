import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { ItemTable } from '../components/ItemTable';
import { Loading } from '../components/Loading';
import { DASHBOARD } from '../graphql/documents';
import { getErrorMessage } from '../graphql/errors';
import type { ItemStatus } from '../graphql/types';

const STAT_CARDS: {
  key: 'total' | 'unclaimed' | 'claimed' | 'returned';
  label: string;
  status?: ItemStatus;
}[] = [
  { key: 'total', label: 'Total items' },
  { key: 'unclaimed', label: 'Unclaimed', status: 'UNCLAIMED' },
  { key: 'claimed', label: 'Claimed', status: 'CLAIMED' },
  { key: 'returned', label: 'Returned', status: 'RETURNED' },
];

export function DashboardPage() {
  const { data, loading, error, refetch } = useQuery(DASHBOARD, {
    fetchPolicy: 'cache-and-network',
  });

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/items/new" className="button button--primary">
          Log item
        </Link>
      </div>

      {error && <ErrorMessage message={getErrorMessage(error)} onRetry={() => void refetch()} />}
      {loading && !data && <Loading />}

      {data && (
        <>
          <section className="stats" aria-label="Item counts">
            {STAT_CARDS.map(({ key, label, status }) => (
              <Link
                key={key}
                to={status ? `/items?status=${status}` : '/items'}
                className={`stat stat--${key}`}
              >
                <span className="stat__value">{data.itemStats[key]}</span>
                <span className="stat__label">{label}</span>
              </Link>
            ))}
          </section>

          <section>
            <div className="page-header">
              <h2>Latest items</h2>
              <Link to="/items">View all</Link>
            </div>
            {data.items.length === 0 ? (
              <EmptyState title="No items logged yet.">
                <Link to="/items/new">Log the first item</Link>
              </EmptyState>
            ) : (
              <ItemTable items={data.items} />
            )}
          </section>
        </>
      )}
    </>
  );
}
