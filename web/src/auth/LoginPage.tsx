import { useMutation } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ErrorMessage } from '../components/ErrorMessage';
import { FormField } from '../components/FormField';
import { LOGIN } from '../graphql/documents';
import { getErrorMessage } from '../graphql/errors';
import { useAuth } from './AuthContext';
import { validateLogin, type FieldErrors, type LoginValues } from './validation';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [loginMutation, { loading, error }] = useMutation(LOGIN);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validateLogin(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    try {
      const { data } = await loginMutation({
        variables: { email: values.email.trim(), password: values.password },
      });
      if (data) {
        login(data.login.accessToken, data.login.user);
        navigate(from, { replace: true });
      }
    } catch {
      // Shown below from the mutation's `error`.
    }
  }

  return (
    <main className="login">
      <form className="card login__card" onSubmit={handleSubmit} noValidate>
        <h1>Lost &amp; Found</h1>
        <p className="muted">Sign in to manage found items.</p>
        {error && <ErrorMessage message={getErrorMessage(error)} />}
        <FormField label="Email" error={errors.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="username"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
            />
          )}
        </FormField>
        <FormField label="Password" error={errors.password}>
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
            />
          )}
        </FormField>
        <button type="submit" className="button button--primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="muted small">Demo: staff@lostfound.test / Password123!</p>
      </form>
    </main>
  );
}
