import { AddableListItem, MakeUpdatable, PersistedListItem } from "./sp-items";

interface UserPhotoListItem {
  Title: string;
  GivenName?: string | undefined;
  Surname?: string | undefined;
  ProfileId?: string | undefined;
  ApplicationId?: string | undefined;
}

export type AddableUserPhotoListItem = AddableListItem & UserPhotoListItem;

export type UpdatableUserPhotoListItem =
  MakeUpdatable<AddableUserPhotoListItem>;

export type PersistedUserPhotoListItem = PersistedListItem & UserPhotoListItem;
