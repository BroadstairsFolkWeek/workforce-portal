import { Effect, Context } from "effect";
import { ModelPersistedUserLogin } from "./interfaces/user-login";

export class UserLoginNotFound {
  readonly _tag = "UserLoginNotFound";
}

export class UserLoginRepository extends Context.Tag("UserLoginRepository")<
  UserLoginRepository,
  {
    readonly modelGetUserLoginByIdentityProviderUserId: (
      userId: string
    ) => Effect.Effect<ModelPersistedUserLogin, UserLoginNotFound>;
  }
>() {}
