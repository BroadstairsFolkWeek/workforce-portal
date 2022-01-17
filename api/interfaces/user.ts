export type User = {
  userId: string;
  identityProvider: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
};

export type PersistedUser = User & {
  dbId: number;
};
