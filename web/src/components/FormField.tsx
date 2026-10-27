import { useId, type ReactNode } from 'react';

export interface FieldControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: (props: FieldControlProps) => ReactNode;
}

/** Label + control + inline error, with the ids wired up for accessibility. */
export function FormField({ label, error, hint, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={error ? 'field field--invalid' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': error ? errorId : undefined })}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && (
        <span className="field__error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}
