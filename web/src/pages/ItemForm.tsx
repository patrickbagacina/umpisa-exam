import { useState, type FormEvent } from 'react';
import { ErrorMessage } from '../components/ErrorMessage';
import { FormField } from '../components/FormField';
import { CATEGORY_LABELS } from '../components/labels';
import type { FieldErrors } from '../auth/validation';
import { ITEM_CATEGORIES, type CreateItemInput, type ItemCategory } from '../graphql/types';
import {
  toCreateItemInput,
  toDateTimeLocal,
  validateItem,
  type ItemFormValues,
} from './validation';

interface ItemFormProps {
  onSubmit: (input: CreateItemInput) => void | Promise<void>;
  submitting?: boolean;
  serverError?: string;
}

export function ItemForm({ onSubmit, submitting = false, serverError }: ItemFormProps) {
  const [values, setValues] = useState<ItemFormValues>(() => ({
    name: '',
    description: '',
    category: '',
    locationFound: '',
    foundAt: toDateTimeLocal(new Date()),
  }));
  const [errors, setErrors] = useState<FieldErrors<ItemFormValues>>({});

  function update<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validateItem(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    void onSubmit(toCreateItemInput(values));
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      {serverError && <ErrorMessage message={serverError} />}
      <FormField label="Name" error={errors.name}>
        {(props) => (
          <input
            {...props}
            value={values.name}
            maxLength={100}
            onChange={(e) => update('name', e.target.value)}
          />
        )}
      </FormField>
      <FormField label="Category" error={errors.category}>
        {(props) => (
          <select
            {...props}
            value={values.category}
            onChange={(e) => update('category', e.target.value as ItemCategory | '')}
          >
            <option value="">Select a category</option>
            {ITEM_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <FormField label="Location found" error={errors.locationFound}>
        {(props) => (
          <input
            {...props}
            value={values.locationFound}
            maxLength={100}
            onChange={(e) => update('locationFound', e.target.value)}
          />
        )}
      </FormField>
      <FormField label="Date found" error={errors.foundAt}>
        {(props) => (
          <input
            {...props}
            type="datetime-local"
            value={values.foundAt}
            onChange={(e) => update('foundAt', e.target.value)}
          />
        )}
      </FormField>
      <FormField
        label="Description (optional)"
        error={errors.description}
        hint={`${values.description.trim().length}/500`}
      >
        {(props) => (
          <textarea
            {...props}
            rows={4}
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
          />
        )}
      </FormField>
      <div className="form__actions">
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save item'}
        </button>
      </div>
    </form>
  );
}
