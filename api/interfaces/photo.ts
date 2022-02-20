import { MakeUpdatable } from "./sp-items";

export type AddablePhoto = {
  title: string;
  givenName?: string;
  surname?: string;
  profileId?: string;
  applicationId?: string;
};

export type UpdatablePhoto = MakeUpdatable<AddablePhoto> & {};

export type Photo = AddablePhoto & {
  dbId: number;
};
