import { useApolloClient } from '@apollo/client/react';
import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import type { User } from '../graphql/types';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { sessionStore } from './session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.get);

  const login = useCallback((token: string, user: User) => sessionStore.set({ token, user }), []);
  const logout = useCallback(() => {
    sessionStore.clear();
    void client.clearStore();
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({ user: session?.user ?? null, isAuthenticated: !!session, login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
