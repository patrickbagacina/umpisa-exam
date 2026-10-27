import { ValidationError } from 'class-validator';
import { validationExceptionFactory } from './validation-exception.factory';

describe('validationExceptionFactory', () => {
  it('returns BAD_USER_INPUT with nested field messages', () => {
    const error = Object.assign(new ValidationError(), {
      property: 'input',
      children: [
        Object.assign(new ValidationError(), {
          property: 'name',
          constraints: { isLength: 'Name must be 2–100 characters' },
          children: [],
        }),
      ],
    });

    const result = validationExceptionFactory([error]);

    expect(result.message).toBe('Name must be 2–100 characters');
    expect(result.extensions).toEqual({
      code: 'BAD_USER_INPUT',
      fields: { 'input.name': ['Name must be 2–100 characters'] },
    });
  });
});
