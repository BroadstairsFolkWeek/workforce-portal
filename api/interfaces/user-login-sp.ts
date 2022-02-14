import {
  AddableListItem,
  PersistedListItem,
  UpdatableListItem,
} from "./sp-items";

interface UserLoginListItem {
  Title: string;
  Email?: string;
  GivenName?: string;
  Surname?: string;
  Telephone?: string;
  Address?: string;
  PhotoIds?: string;
  IdentityProviderUserId: string;
  IdentityProviderUserDetails;
  IdentityProvider: string;
  Version: number;
}

export type AddableUserLoginListItem = AddableListItem & UserLoginListItem;

export type UpdatableUserLoginListItem = UpdatableListItem &
  Partial<AddableUserLoginListItem>;

export type PersistedUserLoginListItem = PersistedListItem & UserLoginListItem;
