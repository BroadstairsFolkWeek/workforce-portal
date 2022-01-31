export type AddableUserLogin = {
  userDetails: string;
  userId: string;
  identityProvider: string;
  email: string;
  givenName: string;
  surname: string;
};

export type UpdatableUserLogin = Partial<AddableUserLogin>;

export type UserLogin = AddableUserLogin & {
  dbId: number;
};
