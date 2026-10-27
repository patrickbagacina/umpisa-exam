export const ITEM_STATUSES = ['UNCLAIMED', 'CLAIMED', 'RETURNED'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_CATEGORIES = [
  'ELECTRONICS',
  'WALLET',
  'BAG',
  'CLOTHING',
  'KEYS',
  'DOCUMENTS',
  'OTHER',
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  category: ItemCategory;
  locationFound: string;
  foundAt: string;
  status: ItemStatus;
  ownerName: string | null;
  ownerContact: string | null;
  claimedAt: string | null;
  returnedAt: string | null;
  loggedBy: User;
  createdAt: string;
}

export interface ItemStats {
  total: number;
  unclaimed: number;
  claimed: number;
  returned: number;
}

export interface CreateItemInput {
  name: string;
  description?: string | null;
  category: ItemCategory;
  locationFound: string;
  foundAt: string;
}

export interface ClaimItemInput {
  ownerName: string;
  ownerContact: string;
}
