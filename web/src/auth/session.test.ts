import { demoUser } from '../app/testUtils';
import { sessionStore } from './session';

describe('sessionStore', () => {
  it('persists the session to localStorage and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = sessionStore.subscribe(listener);

    sessionStore.set({ token: 'abc', user: demoUser });
    expect(sessionStore.getToken()).toBe('abc');
    expect(JSON.parse(localStorage.getItem('lostfound.session')!)).toMatchObject({ token: 'abc' });

    sessionStore.clear();
    expect(sessionStore.get()).toBeNull();
    expect(localStorage.getItem('lostfound.session')).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});
