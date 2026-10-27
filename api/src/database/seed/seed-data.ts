import { ItemCategory, ItemStatus } from '../../items/item.enums';

export const DEMO_USER = {
  email: 'staff@lostfound.test',
  name: 'Demo Staff',
  password: 'Password123!',
};

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SeedItem {
  name: string;
  description: string | null;
  category: ItemCategory;
  locationFound: string;
  foundDaysAgo: number;
  status: ItemStatus;
  owner?: { name: string; contact: string };
}

/** 4 UNCLAIMED, 2 CLAIMED, 2 RETURNED across categories. */
export const SEED_ITEMS: SeedItem[] = [
  {
    name: 'Black iPhone 14',
    description: 'Cracked screen protector, clear case',
    category: ItemCategory.ELECTRONICS,
    locationFound: 'Food court',
    foundDaysAgo: 1,
    status: ItemStatus.UNCLAIMED,
  },
  {
    name: 'Brown leather wallet',
    description: 'No ID inside, two loyalty cards',
    category: ItemCategory.WALLET,
    locationFound: 'Parking level B2',
    foundDaysAgo: 2,
    status: ItemStatus.UNCLAIMED,
  },
  {
    name: 'Set of car keys',
    description: 'Toyota key fob with a red keychain',
    category: ItemCategory.KEYS,
    locationFound: 'Main entrance',
    foundDaysAgo: 3,
    status: ItemStatus.UNCLAIMED,
  },
  {
    name: 'Grey hoodie',
    description: null,
    category: ItemCategory.CLOTHING,
    locationFound: 'Cinema hall 3',
    foundDaysAgo: 5,
    status: ItemStatus.UNCLAIMED,
  },
  {
    name: 'Navy backpack',
    description: 'Contains a laptop charger and notebooks',
    category: ItemCategory.BAG,
    locationFound: 'Bus stop shelter',
    foundDaysAgo: 4,
    status: ItemStatus.CLAIMED,
    owner: { name: 'Maria Santos', contact: 'maria.santos@mail.com' },
  },
  {
    name: 'Passport folder',
    description: 'Blue folder with passport and boarding pass',
    category: ItemCategory.DOCUMENTS,
    locationFound: 'Information desk',
    foundDaysAgo: 6,
    status: ItemStatus.CLAIMED,
    owner: { name: 'John Reyes', contact: '+63 917 555 0101' },
  },
  {
    name: 'Wireless earbuds',
    description: 'White charging case',
    category: ItemCategory.ELECTRONICS,
    locationFound: 'Gym locker room',
    foundDaysAgo: 9,
    status: ItemStatus.RETURNED,
    owner: { name: 'Ana Lim', contact: 'ana.lim@mail.com' },
  },
  {
    name: 'Folding umbrella',
    description: 'Green with a wooden handle',
    category: ItemCategory.OTHER,
    locationFound: 'Lobby',
    foundDaysAgo: 12,
    status: ItemStatus.RETURNED,
    owner: { name: 'Carlo Diaz', contact: '+63 918 555 0199' },
  },
];

export function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * DAY_MS);
}
