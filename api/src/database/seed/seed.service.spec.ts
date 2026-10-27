import { compareSync } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Item } from '../../items/item.entity';
import { ItemStatus } from '../../items/item.enums';
import { User } from '../../users/user.entity';
import { DEMO_USER } from './seed-data';
import { SeedService } from './seed.service';

/** A tiny in-memory stand-in for the two repositories the seeder touches. */
function fakeDataSource() {
  const tables = { users: [] as Partial<User>[], items: [] as Partial<Item>[] };
  const repo = <T>(rows: Partial<T>[], idPrefix: string) => ({
    count: jest.fn(() => Promise.resolve(rows.length)),
    create: jest.fn((data: Partial<T>) => ({ ...data })),
    save: jest.fn((data: Partial<T> | Partial<T>[]) => {
      const list = (Array.isArray(data) ? data : [data]).map((row) => ({
        id: `${idPrefix}-${rows.length + 1}`,
        ...row,
      }));
      rows.push(...list);
      return Promise.resolve(Array.isArray(data) ? list : list[0]);
    }),
  });
  const repos = new Map<unknown, unknown>([
    [User, repo<User>(tables.users, 'user')],
    [Item, repo<Item>(tables.items, 'item')],
  ]);
  const manager = { getRepository: (entity: unknown) => repos.get(entity) };
  const dataSource = {
    transaction: jest.fn((work: (m: typeof manager) => Promise<unknown>) => work(manager)),
  };
  return { tables, dataSource: dataSource as unknown as DataSource };
}

describe('SeedService', () => {
  it('seeds the demo user and 8 items (4/2/2) when users is empty', async () => {
    const { tables, dataSource } = fakeDataSource();

    await expect(new SeedService(dataSource).run()).resolves.toBe(true);

    expect(tables.users).toHaveLength(1);
    expect(tables.users[0].email).toBe(DEMO_USER.email);
    expect(compareSync(DEMO_USER.password, tables.users[0].passwordHash!)).toBe(true);

    const count = (status: ItemStatus) => tables.items.filter((i) => i.status === status).length;
    expect(tables.items).toHaveLength(8);
    expect(count(ItemStatus.UNCLAIMED)).toBe(4);
    expect(count(ItemStatus.CLAIMED)).toBe(2);
    expect(count(ItemStatus.RETURNED)).toBe(2);
    expect(new Set(tables.items.map((i) => i.category)).size).toBeGreaterThan(4);
    expect(tables.items.every((i) => i.loggedById === 'user-1')).toBe(true);
  });

  it('is idempotent: a second run inserts nothing', async () => {
    const { tables, dataSource } = fakeDataSource();
    const seeder = new SeedService(dataSource);

    await seeder.run();
    await expect(seeder.run()).resolves.toBe(false);

    expect(tables.users).toHaveLength(1);
    expect(tables.items).toHaveLength(8);
  });

  it('gives claimed/returned items owner details and timestamps consistent with status', async () => {
    const { tables, dataSource } = fakeDataSource();
    const now = new Date('2026-01-15T12:00:00Z');

    await new SeedService(dataSource).run(now);

    for (const item of tables.items) {
      expect(item.foundAt!.getTime()).toBeLessThanOrEqual(now.getTime());
      const claimed = item.status !== ItemStatus.UNCLAIMED;
      expect(Boolean(item.ownerName && item.ownerContact && item.claimedAt)).toBe(claimed);
      expect(Boolean(item.returnedAt)).toBe(item.status === ItemStatus.RETURNED);
    }
  });
});
