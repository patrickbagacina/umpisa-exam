import type { FieldErrors } from '../auth/validation';
import {
  ITEM_CATEGORIES,
  type ClaimItemInput,
  type CreateItemInput,
  type ItemCategory,
} from '../graphql/types';

export interface ItemFormValues {
  name: string;
  description: string;
  category: ItemCategory | '';
  locationFound: string;
  /** `datetime-local` value, e.g. 2026-10-27T09:30 (local time). */
  foundAt: string;
}

function lengthError(label: string, value: string, min: number, max: number): string | undefined {
  const length = value.trim().length;
  if (length === 0) return `${label} is required`;
  if (length < min) return `${label} must be at least ${min} characters`;
  if (length > max) return `${label} must be at most ${max} characters`;
  return undefined;
}

function compact<T>(errors: Record<keyof T, string | undefined>): FieldErrors<T> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as FieldErrors<T>;
}

/** Mirrors the API's CreateItemInput rules (PLAN.md › Rules). */
export function validateItem(
  values: ItemFormValues,
  now = new Date(),
): FieldErrors<ItemFormValues> {
  const foundAt = values.foundAt ? new Date(values.foundAt) : null;
  return compact<ItemFormValues>({
    name: lengthError('Name', values.name, 2, 100),
    description:
      values.description.trim().length > 500
        ? 'Description must be at most 500 characters'
        : undefined,
    category: ITEM_CATEGORIES.includes(values.category as ItemCategory)
      ? undefined
      : 'Choose a category',
    locationFound: lengthError('Location', values.locationFound, 2, 100),
    foundAt: !foundAt
      ? 'Date found is required'
      : Number.isNaN(foundAt.getTime())
        ? 'Enter a valid date and time'
        : foundAt.getTime() > now.getTime()
          ? 'Date found cannot be in the future'
          : undefined,
  });
}

/** Mirrors the API's ClaimItemInput rules. */
export function validateClaim(values: ClaimItemInput): FieldErrors<ClaimItemInput> {
  return compact<ClaimItemInput>({
    ownerName: lengthError('Owner name', values.ownerName, 2, 100),
    ownerContact: lengthError('Contact', values.ownerContact, 5, 100),
  });
}

export function toCreateItemInput(values: ItemFormValues): CreateItemInput {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    description: description || null,
    category: values.category as ItemCategory,
    locationFound: values.locationFound.trim(),
    foundAt: new Date(values.foundAt).toISOString(),
  };
}

/** Formats a date as a `datetime-local` input value in local time. */
export function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
