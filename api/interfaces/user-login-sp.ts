import {
  AddableListItem,
  PersistedListItem,
  UpdatableListItem,
} from "./sp-items";

interface UserLoginListItem {
  Title: string;
  Email: string;
  GivenName: string;
  Surname: string;
  IdentityProviderUserId: string;
  IdentityProvider: string;
}

export type AddableUserLoginListItem = AddableListItem & UserLoginListItem;

export type UpdatableUserLoginListItem = UpdatableListItem &
  Partial<AddableUserLoginListItem>;

export type PersistedUserLoginListItem = PersistedListItem & UserLoginListItem;
