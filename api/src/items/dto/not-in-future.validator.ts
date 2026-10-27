import { registerDecorator, type ValidationOptions } from 'class-validator';

// Small allowance so a "now" timestamp from a client with a slightly fast clock still passes.
const CLOCK_SKEW_MS = 60_000;

export function IsNotInFuture(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'isNotInFuture',
      target: target.constructor,
      propertyName,
      options: { message: `${propertyName} cannot be in the future`, ...options },
      validator: {
        validate: (value: unknown) =>
          value instanceof Date && value.getTime() <= Date.now() + CLOCK_SKEW_MS,
      },
    });
}
