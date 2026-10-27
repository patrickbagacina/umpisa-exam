import { gql, type TypedDocumentNode } from '@apollo/client';
import type { ClaimItemInput, CreateItemInput, Item, ItemStats, ItemStatus, User } from './types';

const ITEM_FIELDS = gql`
  fragment ItemFields on Item {
    id
    name
    description
    category
    locationFound
    foundAt
    status
    ownerName
    ownerContact
    claimedAt
    returnedAt
    createdAt
    loggedBy {
      id
      email
      name
    }
  }
`;

export const LOGIN: TypedDocumentNode<
  { login: { accessToken: string; user: User } },
  { email: string; password: string }
> = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const DASHBOARD: TypedDocumentNode<{ itemStats: ItemStats; items: Item[] }> = gql`
  query Dashboard {
    itemStats {
      total
      unclaimed
      claimed
      returned
    }
    items(limit: 5) {
      ...ItemFields
    }
  }
  ${ITEM_FIELDS}
`;

export const ITEMS: TypedDocumentNode<
  { items: Item[] },
  { status?: ItemStatus | null; search?: string | null; limit?: number | null }
> = gql`
  query Items($status: ItemStatus, $search: String, $limit: Int) {
    items(status: $status, search: $search, limit: $limit) {
      ...ItemFields
    }
  }
  ${ITEM_FIELDS}
`;

export const ITEM: TypedDocumentNode<{ item: Item }, { id: string }> = gql`
  query Item($id: ID!) {
    item(id: $id) {
      ...ItemFields
    }
  }
  ${ITEM_FIELDS}
`;

export const CREATE_ITEM: TypedDocumentNode<{ createItem: Item }, { input: CreateItemInput }> = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      ...ItemFields
    }
  }
  ${ITEM_FIELDS}
`;

export const CLAIM_ITEM: TypedDocumentNode<
  { claimItem: Item },
  { id: string; input: ClaimItemInput }
> = gql`
  mutation ClaimItem($id: ID!, $input: ClaimItemInput!) {
    claimItem(id: $id, input: $input) {
      ...ItemFields
    }
  }
  ${ITEM_FIELDS}
`;

export const RELEASE_CLAIM: TypedDocumentNode<{ releaseClaim: Item }, { id: string }> = gql`
  mutation ReleaseClaim($id: ID!) {
    releaseClaim(id: $id) {
      ...ItemFields
    }
  }
  ${ITEM_FIELDS}
`;

export const RETURN_ITEM: TypedDocumentNode<{ returnItem: Item }, { id: string }> = gql`
  mutation ReturnItem($id: ID!) {
    returnItem(id: $id) {
      ...ItemFields
    }
  }
  ${ITEM_FIELDS}
`;
