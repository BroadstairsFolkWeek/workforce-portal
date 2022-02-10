import {
  AddableListItem,
  PersistedListItem,
  UpdatableListItem,
} from "./sp-items";

interface UserPhotoListItem {
  Title: string;
  GivenName?: string;
  Surname?: string;
  IdentityProviderUserId: string;
}

export type AddableUserPhotoListItem = AddableListItem & UserPhotoListItem;

export type UpdatableUserPhotoListItem = UpdatableListItem &
  Partial<AddableUserPhotoListItem>;

export type PersistedUserPhotoListItem = PersistedListItem & UserPhotoListItem;
