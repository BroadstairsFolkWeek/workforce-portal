import { Number, String, Record, Static, Optional } from "runtypes";
import { Application } from "./application";

// UserProfile Data Transfer Object for data posted to the API.
export const UserProfileUpdateDtoRunType = Record({
  displayName: String,
  givenName: Optional(String),
  surname: Optional(String),
  telephone: Optional(String),
  address: Optional(String),
  version: Number,
});

export type UserProfileDtd = Static<typeof UserProfileUpdateDtoRunType>;

export type AddableUserLogin = UserProfileDtd & {
  email?: string;
  photoIds: string[];
  identityProvider: string;
  identityProviderUserId: string;
  identityProviderUserDetails: string;
};

export type UpdatableUserLogin = Partial<AddableUserLogin> & {
  version: number;
};

export type UserLogin = AddableUserLogin & {
  dbId: number;
};

export type UserLoginWithCurrentApplication = {
  profile: UserLogin;
  application?: Application;
};
