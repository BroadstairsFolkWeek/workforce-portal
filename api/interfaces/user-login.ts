export type AddableUserLogin = {
  displayName: string;
  givenName?: string | undefined;
  surname?: string | undefined;
  email?: string | undefined;
  identityProvider: string;
  identityProviderUserId: string;
  identityProviderUserDetails: string;
  profileId: string;
};

export type UpdatableUserLogin = Partial<AddableUserLogin> & {};

export type UserLogin = AddableUserLogin & {
  dbId: number;
};
