import { registerEnumType } from '@nestjs/graphql';

export enum ItemStatus {
  UNCLAIMED = 'UNCLAIMED',
  CLAIMED = 'CLAIMED',
  RETURNED = 'RETURNED',
}

export enum ItemCategory {
  ELECTRONICS = 'ELECTRONICS',
  WALLET = 'WALLET',
  BAG = 'BAG',
  CLOTHING = 'CLOTHING',
  KEYS = 'KEYS',
  DOCUMENTS = 'DOCUMENTS',
  OTHER = 'OTHER',
}

registerEnumType(ItemStatus, { name: 'ItemStatus' });
registerEnumType(ItemCategory, { name: 'ItemCategory' });
