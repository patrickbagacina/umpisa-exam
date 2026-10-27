import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('sends a logged-out visitor to the login page', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Lost & Found' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });
});
