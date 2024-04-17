import { Number, String, Record, Static, Optional } from "runtypes";
import { Application } from "./application";

//  Data Transfer Object for data posted to the API.
export const ProfileUpdateDtoRunType = Record({
  displayName: String,
  givenName: Optional(String),
  surname: Optional(String),
  telephone: Optional(String),
  address: Optional(String),
  version: Number,
});

export type ProfileDto = Static<typeof ProfileUpdateDtoRunType>;

export type AddableProfile = ProfileDto & {
  profileId: string;
  email?: string | undefined;
  photoIds: string[];
};

export type UpdatableProfile = Partial<AddableProfile> & {
  version: number;
};

export type Profile = AddableProfile & {
  dbId: number;
};

export type ProfileWithCurrentApplication = {
  profile: Profile;
  application?: Application | undefined;
};
