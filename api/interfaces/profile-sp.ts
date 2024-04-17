import {
  AddableListItem,
  PersistedListItem,
  UpdatableListItem,
} from "./sp-items";

interface ProfileListItem {
  ProfileId: string;
  Title: string;
  Email?: string | undefined;
  GivenName?: string | undefined;
  Surname?: string | undefined;
  Telephone?: string | undefined;
  Address?: string | undefined;
  PhotoIds?: string | undefined;
  Version: number;
}

export type AddableProfileListItem = AddableListItem & ProfileListItem;

export type UpdatableProfileListItem = UpdatableListItem &
  Partial<AddableProfileListItem>;

export type PersistedProfileListItem = PersistedListItem & ProfileListItem;
