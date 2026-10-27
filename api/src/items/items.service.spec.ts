import { GraphQLError } from 'graphql';
import { FindOperator, Repository } from 'typeorm';
import { InvalidTransitionError } from './item-status';
import { Item } from './item.entity';
import { ItemCategory, ItemStatus } from './item.enums';
import { ItemsService, likePattern } from './items.service';

function makeItem(overrides: Partial<Item> = {}): Item {
  return Object.assign(new Item(), {
    id: 'item-1',
    name: 'Blue umbrella',
    description: null,
    category: ItemCategory.OTHER,
    locationFound: 'Lobby',
    foundAt: new Date('2026-01-01T10:00:00Z'),
    status: ItemStatus.UNCLAIMED,
    ownerName: null,
    ownerContact: null,
    claimedAt: null,
    returnedAt: null,
    loggedById: 'user-1',
    createdAt: new Date('2026-01-01T10:05:00Z'),
    ...overrides,
  });
}

describe('ItemsService', () => {
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    countBy: jest.Mock;
    update: jest.Mock;
  };
  let service: ItemsService;

  beforeEach(() => {
    repo = {
      create: jest.fn((data: Partial<Item>) => ({ ...data })),
      save: jest.fn((data: Partial<Item>) => Promise.resolve({ ...data, id: 'new-id' })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      countBy: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    service = new ItemsService(repo as unknown as Repository<Item>);
  });

  describe('create', () => {
    it('saves an UNCLAIMED item logged by the current user and returns it with loggedBy', async () => {
      const saved = makeItem({ id: 'new-id' });
      repo.findOne.mockResolvedValue(saved);

      const result = await service.create(
        {
          name: 'Blue umbrella',
          description: '',
          category: ItemCategory.OTHER,
          locationFound: 'Lobby',
          foundAt: saved.foundAt,
        },
        'user-1',
      );

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ItemStatus.UNCLAIMED,
          loggedById: 'user-1',
          description: null,
        }),
      );
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'new-id' },
        relations: { loggedBy: true },
      });
      expect(result).toBe(saved);
    });
  });

  describe('findAll', () => {
    it('lists everything newest-found first when no filters are given', async () => {
      await service.findAll({});

      expect(repo.find).toHaveBeenCalledWith({
        where: {},
        relations: { loggedBy: true },
        order: { foundAt: 'DESC', createdAt: 'DESC' },
        take: undefined,
      });
    });

    it('filters by status and applies the limit', async () => {
      await service.findAll({ status: ItemStatus.CLAIMED, limit: 5 });

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: ItemStatus.CLAIMED }, take: 5 }),
      );
    });

    it('searches name, description or locationFound case-insensitively', async () => {
      await service.findAll({ status: ItemStatus.UNCLAIMED, search: '  Umbrella ' });

      const [{ where }] = repo.find.mock.calls[0] as [{ where: Record<string, unknown>[] }];
      expect(where).toHaveLength(3);
      expect(where.map((w) => Object.keys(w).sort())).toEqual([
        ['name', 'status'],
        ['description', 'status'],
        ['locationFound', 'status'],
      ]);

      const op = where[0].name as FindOperator<unknown>;
      expect(op.getSql?.('`Item`.`name`')).toBe('LOWER(`Item`.`name`) LIKE :search');
      expect(op.objectLiteralParameters).toEqual({ search: '%umbrella%' });
    });

    it('ignores a blank search', async () => {
      await service.findAll({ search: '   ' });
      expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
    });
  });

  describe('likePattern', () => {
    it('lowercases and escapes LIKE wildcards', () => {
      expect(likePattern('50%_Off\\')).toBe('%50\\%\\_off\\\\%');
    });
  });

  describe('findOne', () => {
    it('throws NOT_FOUND when the item does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      const error = await service.findOne('missing').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(GraphQLError);
      expect((error as GraphQLError).extensions.code).toBe('NOT_FOUND');
    });
  });

  describe('stats', () => {
    it('counts each status and the total', async () => {
      const counts = { UNCLAIMED: 4, CLAIMED: 2, RETURNED: 2 };
      repo.countBy.mockImplementation(({ status }: { status: ItemStatus }) =>
        Promise.resolve(counts[status]),
      );

      await expect(service.stats()).resolves.toEqual({
        total: 8,
        unclaimed: 4,
        claimed: 2,
        returned: 2,
      });
    });
  });

  describe('status changes', () => {
    beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-02-01T09:00:00Z')));
    afterEach(() => jest.useRealTimers());

    it('claim sets owner details and claimedAt, guarded on the current status', async () => {
      repo.findOne.mockResolvedValue(makeItem());

      const result = await service.claim('item-1', {
        ownerName: 'Ana Cruz',
        ownerContact: 'ana@mail.com',
      });

      const patch = {
        ownerName: 'Ana Cruz',
        ownerContact: 'ana@mail.com',
        claimedAt: new Date('2026-02-01T09:00:00Z'),
        status: ItemStatus.CLAIMED,
      };
      expect(repo.update).toHaveBeenCalledWith(
        { id: 'item-1', status: ItemStatus.UNCLAIMED },
        patch,
      );
      expect(result).toMatchObject(patch);
    });

    it('releaseClaim clears owner details', async () => {
      repo.findOne.mockResolvedValue(
        makeItem({
          status: ItemStatus.CLAIMED,
          ownerName: 'Ana Cruz',
          ownerContact: 'ana@mail.com',
          claimedAt: new Date(),
        }),
      );

      const result = await service.release('item-1');

      expect(result).toMatchObject({
        status: ItemStatus.UNCLAIMED,
        ownerName: null,
        ownerContact: null,
        claimedAt: null,
      });
    });

    it('return sets returnedAt and keeps owner details', async () => {
      repo.findOne.mockResolvedValue(
        makeItem({ status: ItemStatus.CLAIMED, ownerName: 'Ana Cruz' }),
      );

      const result = await service.return('item-1');

      expect(result).toMatchObject({
        status: ItemStatus.RETURNED,
        returnedAt: new Date('2026-02-01T09:00:00Z'),
        ownerName: 'Ana Cruz',
      });
    });

    it('rejects a disallowed transition without writing', async () => {
      repo.findOne.mockResolvedValue(makeItem({ status: ItemStatus.UNCLAIMED }));

      await expect(service.return('item-1')).rejects.toThrow(
        new InvalidTransitionError('return', ItemStatus.UNCLAIMED),
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('rejects when the status changed between read and write', async () => {
      repo.findOne
        .mockResolvedValueOnce(makeItem({ status: ItemStatus.UNCLAIMED }))
        .mockResolvedValueOnce(makeItem({ status: ItemStatus.CLAIMED }));
      repo.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.claim('item-1', { ownerName: 'Ana Cruz', ownerContact: 'ana@mail.com' }),
      ).rejects.toThrow('Cannot claim an item that is CLAIMED');
    });

    it('throws NOT_FOUND for a missing item', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.release('nope')).rejects.toThrow('Item not found');
    });
  });
});
