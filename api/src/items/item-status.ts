import { GraphQLError } from 'graphql';
import { ItemStatus } from './item.enums';

export type ItemAction = 'claim' | 'release' | 'return';

const TRANSITIONS: Record<ItemAction, { from: ItemStatus; to: ItemStatus }> = {
  claim: { from: ItemStatus.UNCLAIMED, to: ItemStatus.CLAIMED },
  release: { from: ItemStatus.CLAIMED, to: ItemStatus.UNCLAIMED },
  return: { from: ItemStatus.CLAIMED, to: ItemStatus.RETURNED },
};

export class InvalidTransitionError extends GraphQLError {
  constructor(action: ItemAction, status: ItemStatus) {
    super(`Cannot ${action} an item that is ${status}`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}

/** The single source of truth for item status changes. Throws on any disallowed transition. */
export function transition(status: ItemStatus, action: ItemAction): ItemStatus {
  const rule = TRANSITIONS[action];
  if (status !== rule.from) throw new InvalidTransitionError(action, status);
  return rule.to;
}
