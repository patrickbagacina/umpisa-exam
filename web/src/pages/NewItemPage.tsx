import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { CREATE_ITEM } from '../graphql/documents';
import { getErrorMessage } from '../graphql/errors';
import type { CreateItemInput } from '../graphql/types';
import { ItemForm } from './ItemForm';

export function NewItemPage() {
  const navigate = useNavigate();
  const [createItem, { loading, error }] = useMutation(CREATE_ITEM);

  async function handleSubmit(input: CreateItemInput) {
    try {
      const { data } = await createItem({ variables: { input } });
      if (data) navigate(`/items/${data.createItem.id}`);
    } catch {
      // Shown by ItemForm from the mutation's `error`.
    }
  }

  return (
    <>
      <h1>Log found item</h1>
      <ItemForm
        onSubmit={handleSubmit}
        submitting={loading}
        serverError={error ? getErrorMessage(error) : undefined}
      />
    </>
  );
}
