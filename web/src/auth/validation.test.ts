import { validateLogin } from './validation';

describe('validateLogin', () => {
  it('requires email and password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    });
  });

  it('rejects a malformed email', () => {
    expect(validateLogin({ email: 'staff@', password: 'x' })).toEqual({
      email: 'Enter a valid email',
    });
  });

  it('accepts valid credentials', () => {
    expect(validateLogin({ email: 'staff@lostfound.test', password: 'Password123!' })).toEqual({});
  });
});
