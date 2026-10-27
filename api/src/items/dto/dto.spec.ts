import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ItemCategory, ItemStatus } from '../item.enums';
import { ClaimItemInput } from './claim-item.input';
import { CreateItemInput } from './create-item.input';
import { ItemsArgs } from './items.args';

function errorsFor<T extends object>(cls: new () => T, plain: object): Record<string, string[]> {
  const errors = validateSync(plainToInstance(cls, plain));
  return Object.fromEntries(errors.map((e) => [e.property, Object.values(e.constraints ?? {})]));
}

describe('CreateItemInput', () => {
  const valid = {
    name: 'Blue umbrella',
    category: ItemCategory.OTHER,
    locationFound: 'Lobby',
    foundAt: new Date(Date.now() - 1000),
  };

  it('accepts a valid item without a description', () => {
    expect(errorsFor(CreateItemInput, valid)).toEqual({});
  });

  it('accepts an ISO string for foundAt', () => {
    expect(errorsFor(CreateItemInput, { ...valid, foundAt: '2025-01-01T10:00:00Z' })).toEqual({});
  });

  it.each([
    ['name too short', { name: 'a' }, 'name'],
    ['name too long', { name: 'x'.repeat(101) }, 'name'],
    ['description too long', { description: 'x'.repeat(501) }, 'description'],
    ['unknown category', { category: 'FOOD' }, 'category'],
    ['location too short', { locationFound: 'L' }, 'locationFound'],
    ['location too long', { locationFound: 'x'.repeat(101) }, 'locationFound'],
    ['foundAt missing', { foundAt: undefined }, 'foundAt'],
    ['foundAt in the future', { foundAt: new Date(Date.now() + 86_400_000) }, 'foundAt'],
  ])('rejects %s', (_label, override, field) => {
    expect(Object.keys(errorsFor(CreateItemInput, { ...valid, ...override }))).toEqual([field]);
  });

  it('accepts boundary lengths', () => {
    const input = {
      ...valid,
      name: 'ab',
      locationFound: 'x'.repeat(100),
      description: 'x'.repeat(500),
    };
    expect(errorsFor(CreateItemInput, input)).toEqual({});
  });

  it('uses readable messages', () => {
    expect(errorsFor(CreateItemInput, { ...valid, name: 'a' }).name).toEqual([
      'Name must be 2–100 characters',
    ]);
  });
});

describe('ClaimItemInput', () => {
  it('accepts a valid owner', () => {
    expect(
      errorsFor(ClaimItemInput, { ownerName: 'Ana Cruz', ownerContact: 'ana@mail.com' }),
    ).toEqual({});
  });

  it('enforces ownerName 2–100 and ownerContact 5–100', () => {
    expect(
      Object.keys(errorsFor(ClaimItemInput, { ownerName: 'A', ownerContact: '1234' })),
    ).toEqual(['ownerName', 'ownerContact']);
    expect(
      Object.keys(
        errorsFor(ClaimItemInput, { ownerName: 'x'.repeat(101), ownerContact: 'x'.repeat(101) }),
      ),
    ).toEqual(['ownerName', 'ownerContact']);
  });
});

describe('ItemsArgs', () => {
  it('allows all fields to be omitted', () => {
    expect(errorsFor(ItemsArgs, {})).toEqual({});
  });

  it('accepts a status, search and limit', () => {
    expect(errorsFor(ItemsArgs, { status: ItemStatus.CLAIMED, search: 'key', limit: 5 })).toEqual(
      {},
    );
  });

  it('rejects a limit outside 1–100', () => {
    expect(Object.keys(errorsFor(ItemsArgs, { limit: 0 }))).toEqual(['limit']);
    expect(Object.keys(errorsFor(ItemsArgs, { limit: 101 }))).toEqual(['limit']);
  });
});
