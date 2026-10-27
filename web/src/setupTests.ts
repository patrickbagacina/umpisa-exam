import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { sessionStore } from './auth/session';

afterEach(() => {
  cleanup();
  sessionStore.clear();
  localStorage.clear();
});
