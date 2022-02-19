export type AddableUserLogin = {
  displayName: string;
  givenName?: string;
  surname?: string;
  email?: string;
  identityProvider: string;
  identityProviderUserId: string;
  identityProviderUserDetails: string;
  profileId: string;
};

export type UpdatableUserLogin = Partial<AddableUserLogin> & {};

export type UserLogin = AddableUserLogin & {
  dbId: number;
};
