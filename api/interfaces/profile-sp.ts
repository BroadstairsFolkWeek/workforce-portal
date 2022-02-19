import {
  AddableListItem,
  PersistedListItem,
  UpdatableListItem,
} from "./sp-items";

interface ProfileListItem {
  ProfileId: string;
  Title: string;
  Email?: string;
  GivenName?: string;
  Surname?: string;
  Telephone?: string;
  Address?: string;
  PhotoIds?: string;
  Version: number;
}

export type AddableProfileListItem = AddableListItem & ProfileListItem;

export type UpdatableProfileListItem = UpdatableListItem &
  Partial<AddableProfileListItem>;

export type PersistedProfileListItem = PersistedListItem & ProfileListItem;
