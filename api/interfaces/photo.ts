import { MakeUpdatable } from "./sp-items";

export type AddablePhoto = {
  title: string;
  givenName?: string | undefined;
  surname?: string | undefined;
  profileId?: string | undefined;
  applicationId?: string | undefined;
};

export type UpdatablePhoto = MakeUpdatable<AddablePhoto> & {};

export type Photo = AddablePhoto & {
  dbId: number;
};
