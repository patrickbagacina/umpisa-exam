import { useState, type FormEvent } from 'react';
import type { FieldErrors } from '../auth/validation';
import { FormField } from '../components/FormField';
import type { ClaimItemInput } from '../graphql/types';
import { validateClaim } from './validation';

interface ClaimFormProps {
  onSubmit: (input: ClaimItemInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function ClaimForm({ onSubmit, onCancel, submitting = false }: ClaimFormProps) {
  const [values, setValues] = useState<ClaimItemInput>({ ownerName: '', ownerContact: '' });
  const [errors, setErrors] = useState<FieldErrors<ClaimItemInput>>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validateClaim(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    void onSubmit({ ownerName: values.ownerName.trim(), ownerContact: values.ownerContact.trim() });
  }

  return (
    <form className="form claim-form" onSubmit={handleSubmit} noValidate aria-label="Record claim">
      <FormField label="Owner name" error={errors.ownerName}>
        {(props) => (
          <input
            {...props}
            value={values.ownerName}
            maxLength={100}
            onChange={(e) => setValues({ ...values, ownerName: e.target.value })}
          />
        )}
      </FormField>
      <FormField label="Owner contact" error={errors.ownerContact} hint="Email or phone">
        {(props) => (
          <input
            {...props}
            value={values.ownerContact}
            maxLength={100}
            onChange={(e) => setValues({ ...values, ownerContact: e.target.value })}
          />
        )}
      </FormField>
      <div className="form__actions">
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save claim'}
        </button>
        <button type="button" className="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
