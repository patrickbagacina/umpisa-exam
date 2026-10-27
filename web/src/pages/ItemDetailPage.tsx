import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { CATEGORY_LABELS, formatDateTime } from '../components/labels';
import { Loading } from '../components/Loading';
import { StatusBadge } from '../components/StatusBadge';
import { CLAIM_ITEM, ITEM, RELEASE_CLAIM, RETURN_ITEM } from '../graphql/documents';
import { getErrorMessage, hasErrorCode } from '../graphql/errors';
import type { ClaimItemInput } from '../graphql/types';
import { ClaimForm } from './ClaimForm';

export function ItemDetailPage() {
  const { id = '' } = useParams();
  const { data, loading, error, refetch } = useQuery(ITEM, { variables: { id } });
  const [claimItem, claimState] = useMutation(CLAIM_ITEM);
  const [releaseClaim, releaseState] = useMutation(RELEASE_CLAIM);
  const [returnItem, returnState] = useMutation(RETURN_ITEM);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const busy = claimState.loading || releaseState.loading || returnState.loading;

  async function run(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      setShowClaimForm(false);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  const handleClaim = (input: ClaimItemInput) => run(() => claimItem({ variables: { id, input } }));
  const handleRelease = () => run(() => releaseClaim({ variables: { id } }));
  const handleReturn = () => run(() => returnItem({ variables: { id } }));

  if (loading && !data) return <Loading />;
  if (hasErrorCode(error, 'NOT_FOUND')) {
    return (
      <EmptyState title="Item not found.">
        <Link to="/items">Back to items</Link>
      </EmptyState>
    );
  }
  if (error || !data) {
    return (
      <ErrorMessage
        message={error ? getErrorMessage(error) : 'Item not found.'}
        onRetry={() => void refetch()}
      />
    );
  }

  const item = data.item;

  return (
    <>
      <p>
        <Link to="/items">← Back to items</Link>
      </p>
      <div className="page-header">
        <h1>{item.name}</h1>
        <StatusBadge status={item.status} />
      </div>

      <section className="card">
        <dl className="details">
          <dt>Category</dt>
          <dd>{CATEGORY_LABELS[item.category]}</dd>
          <dt>Location found</dt>
          <dd>{item.locationFound}</dd>
          <dt>Found on</dt>
          <dd>{formatDateTime(item.foundAt)}</dd>
          <dt>Description</dt>
          <dd>{item.description || '—'}</dd>
          <dt>Logged by</dt>
          <dd>
            {item.loggedBy.name} · {formatDateTime(item.createdAt)}
          </dd>
          {item.ownerName && (
            <>
              <dt>Owner</dt>
              <dd>{item.ownerName}</dd>
              <dt>Owner contact</dt>
              <dd>{item.ownerContact}</dd>
              <dt>Claimed on</dt>
              <dd>{formatDateTime(item.claimedAt)}</dd>
            </>
          )}
          {item.returnedAt && (
            <>
              <dt>Returned on</dt>
              <dd>{formatDateTime(item.returnedAt)}</dd>
            </>
          )}
        </dl>
      </section>

      <section className="card actions" aria-label="Actions">
        {actionError && <ErrorMessage message={actionError} />}

        {item.status === 'UNCLAIMED' &&
          (showClaimForm ? (
            <ClaimForm
              onSubmit={handleClaim}
              onCancel={() => setShowClaimForm(false)}
              submitting={busy}
            />
          ) : (
            <button
              type="button"
              className="button button--primary"
              onClick={() => setShowClaimForm(true)}
            >
              Record claim
            </button>
          ))}

        {item.status === 'CLAIMED' && (
          <div className="form__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={handleReturn}
              disabled={busy}
            >
              {returnState.loading ? 'Saving…' : 'Mark returned'}
            </button>
            <button type="button" className="button" onClick={handleRelease} disabled={busy}>
              {releaseState.loading ? 'Saving…' : 'Release claim'}
            </button>
          </div>
        )}

        {item.status === 'RETURNED' && (
          <p className="muted">This item has been returned to its owner. No further actions.</p>
        )}
      </section>
    </>
  );
}
