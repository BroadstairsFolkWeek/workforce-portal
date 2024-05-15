import { Schema as S } from "@effect/schema";

export const AuthenticatedUserId = S.String.pipe(
  S.brand("AuthenticatedUserId")
);
export type AuthenticatedUserId = S.Schema.Type<typeof AuthenticatedUserId>;

export const AuthenticatedUser = S.Struct({
  identityProvider: S.String,
  userId: AuthenticatedUserId,
  userDetails: S.String,
  userRoles: S.Array(S.String),
});

export type AuthenticateUser = S.Schema.Type<typeof AuthenticatedUser>;
