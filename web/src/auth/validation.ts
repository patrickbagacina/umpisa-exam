export interface LoginValues {
  email: string;
  password: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email';
  if (!values.password) errors.password = 'Password is required';
  return errors;
}
