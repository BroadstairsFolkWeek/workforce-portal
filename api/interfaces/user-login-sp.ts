import {
  AddableListItem,
  PersistedListItem,
  UpdatableListItem,
} from "./sp-items";

interface UserLoginListItem {
  Title: string;
  Email?: string | undefined;
  GivenName?: string | undefined;
  Surname?: string | undefined;
  IdentityProviderUserId: string;
  IdentityProviderUserDetails: string;
  IdentityProvider: string;
  ProfileId: string;
}

export type AddableUserLoginListItem = AddableListItem & UserLoginListItem;

export type UpdatableUserLoginListItem = UpdatableListItem &
  Partial<AddableUserLoginListItem>;

export type PersistedUserLoginListItem = PersistedListItem & UserLoginListItem;
