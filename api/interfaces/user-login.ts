export type AddableUserLogin = {
  displayName: string;
  email?: string;
  givenName?: string;
  surname?: string;
  photoRequired: boolean;
  identityProvider: string;
  identityProviderUserId: string;
  identityProviderUserDetails: string;
};

export type UpdatableUserLogin = Partial<AddableUserLogin>;

export type UserLogin = AddableUserLogin & {
  dbId: number;
};
