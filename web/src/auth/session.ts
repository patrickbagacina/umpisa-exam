import type { User } from '../graphql/types';

export interface Session {
  token: string;
  user: User;
}

const STORAGE_KEY = 'lostfound.session';
const listeners = new Set<() => void>();
let current: Session | null = read();

function read(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed.token && parsed.user ? parsed : null;
  } catch {
    return null;
  }
}

function write(session: Session | null) {
  current = session;
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode): keep the session in memory only.
  }
  listeners.forEach((listener) => listener());
}

/** Session kept in localStorage; read by the Apollo auth link and the AuthProvider. */
export const sessionStore = {
  get: (): Session | null => current,
  getToken: (): string | null => current?.token ?? null,
  set: (session: Session) => write(session),
  clear: () => {
    if (current) write(null);
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
