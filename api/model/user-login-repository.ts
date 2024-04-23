import { Effect, Context } from "effect";
import { ModelPersistedUserLogin } from "./interfaces/user-login";
import { UserLoginNotFound } from "./user-logins-repository-graph";

export class UserLoginRepository extends Context.Tag("UserLoginRepository")<
  UserLoginRepository,
  {
    readonly modelGetUserLoginByIdentityProviderUserId: (
      userId: string
    ) => Effect.Effect<ModelPersistedUserLogin, UserLoginNotFound>;
  }
>() {}
