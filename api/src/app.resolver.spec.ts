import { AppResolver } from './app.resolver';

describe('AppResolver', () => {
  it('health returns ok', () => {
    expect(new AppResolver().health()).toBe('ok');
  });
});
