import { InvalidTransitionError, ItemAction, transition } from './item-status';
import { ItemStatus } from './item.enums';

const { UNCLAIMED, CLAIMED, RETURNED } = ItemStatus;

describe('transition', () => {
  it.each<[ItemStatus, ItemAction, ItemStatus]>([
    [UNCLAIMED, 'claim', CLAIMED],
    [CLAIMED, 'release', UNCLAIMED],
    [CLAIMED, 'return', RETURNED],
  ])('%s --%s--> %s', (from, action, to) => {
    expect(transition(from, action)).toBe(to);
  });

  it.each<[ItemStatus, ItemAction]>([
    [UNCLAIMED, 'release'],
    [UNCLAIMED, 'return'],
    [CLAIMED, 'claim'],
    [RETURNED, 'claim'],
    [RETURNED, 'release'],
    [RETURNED, 'return'],
  ])('rejects %s --%s--> with BAD_USER_INPUT', (from, action) => {
    let error: unknown;
    try {
      transition(from, action);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(InvalidTransitionError);
    expect((error as InvalidTransitionError).message).toBe(
      `Cannot ${action} an item that is ${from}`,
    );
    expect((error as InvalidTransitionError).extensions.code).toBe('BAD_USER_INPUT');
  });
});
