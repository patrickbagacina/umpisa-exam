import { toCreateItemInput, toDateTimeLocal, validateClaim, validateItem } from './validation';

const now = new Date(2026, 9, 27, 12, 0);
const valid = {
  name: 'Blue umbrella',
  description: '',
  category: 'OTHER' as const,
  locationFound: 'Lobby',
  foundAt: '2026-10-27T09:30',
};

describe('validateItem', () => {
  it('accepts a valid item', () => {
    expect(validateItem(valid, now)).toEqual({});
  });

  it('enforces name and location lengths', () => {
    expect(validateItem({ ...valid, name: 'a', locationFound: '' }, now)).toEqual({
      name: 'Name must be at least 2 characters',
      locationFound: 'Location is required',
    });
    expect(validateItem({ ...valid, name: 'x'.repeat(101) }, now).name).toBe(
      'Name must be at most 100 characters',
    );
    expect(validateItem({ ...valid, name: '  a  ' }, now).name).toBeDefined();
  });

  it('limits description to 500 characters', () => {
    expect(validateItem({ ...valid, description: 'x'.repeat(500) }, now)).toEqual({});
    expect(validateItem({ ...valid, description: 'x'.repeat(501) }, now).description).toBe(
      'Description must be at most 500 characters',
    );
  });

  it('requires a known category', () => {
    expect(validateItem({ ...valid, category: '' }, now).category).toBe('Choose a category');
  });

  it('requires foundAt and rejects future dates', () => {
    expect(validateItem({ ...valid, foundAt: '' }, now).foundAt).toBe('Date found is required');
    expect(validateItem({ ...valid, foundAt: '2026-10-27T12:01' }, now).foundAt).toBe(
      'Date found cannot be in the future',
    );
    expect(validateItem({ ...valid, foundAt: '2026-10-27T12:00' }, now)).toEqual({});
  });
});

describe('validateClaim', () => {
  it('enforces owner name 2–100 and contact 5–100', () => {
    expect(validateClaim({ ownerName: 'A', ownerContact: '1234' })).toEqual({
      ownerName: 'Owner name must be at least 2 characters',
      ownerContact: 'Contact must be at least 5 characters',
    });
    expect(validateClaim({ ownerName: 'Ana Cruz', ownerContact: 'ana@mail.com' })).toEqual({});
  });
});

describe('toCreateItemInput', () => {
  it('trims fields, nulls an empty description and sends foundAt as ISO', () => {
    expect(toCreateItemInput({ ...valid, name: '  Blue umbrella ', description: '  ' })).toEqual({
      name: 'Blue umbrella',
      description: null,
      category: 'OTHER',
      locationFound: 'Lobby',
      foundAt: new Date(2026, 9, 27, 9, 30).toISOString(),
    });
  });
});

describe('toDateTimeLocal', () => {
  it('formats local time for a datetime-local input', () => {
    expect(toDateTimeLocal(new Date(2026, 0, 5, 7, 3))).toBe('2026-01-05T07:03');
  });
});
