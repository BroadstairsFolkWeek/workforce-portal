import { AddableListItem, MakeUpdatable, PersistedListItem } from "./sp-items";

interface UserPhotoListItem {
  Title: string;
  GivenName?: string;
  Surname?: string;
  ProfileId?: string;
  ApplicationId?: string;
}

export type AddableUserPhotoListItem = AddableListItem & UserPhotoListItem;

export type UpdatableUserPhotoListItem =
  MakeUpdatable<AddableUserPhotoListItem>;

export type PersistedUserPhotoListItem = PersistedListItem & UserPhotoListItem;
