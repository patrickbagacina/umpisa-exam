import type { ItemStatus } from '../graphql/types';
import { STATUS_LABELS } from './labels';

export function StatusBadge({ status }: { status: ItemStatus }) {
  return <span className={`badge badge--${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}
