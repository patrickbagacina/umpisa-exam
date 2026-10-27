import type { ItemCategory, ItemStatus } from '../graphql/types';

export const STATUS_LABELS: Record<ItemStatus, string> = {
  UNCLAIMED: 'Unclaimed',
  CLAIMED: 'Claimed',
  RETURNED: 'Returned',
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  ELECTRONICS: 'Electronics',
  WALLET: 'Wallet',
  BAG: 'Bag',
  CLOTHING: 'Clothing',
  KEYS: 'Keys',
  DOCUMENTS: 'Documents',
  OTHER: 'Other',
};

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormat.format(date);
}
