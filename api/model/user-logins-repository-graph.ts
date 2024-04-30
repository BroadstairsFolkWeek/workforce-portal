import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import {
  ModelAddableUserLogin,
  ModelPersistedUserLogin,
} from "./interfaces/user-login";
import {
  InvalidUserLoginValue,
  UserLoginNotFound,
  UserLoginRepository,
} from "./user-login-repository";
import { UserLoginsGraphListAccess } from "./graph/user-logins-graph-list-access";

const listItemToUserLogin = (item: any) => {
  // Apply defaults for any missing fields.
  const itemWithDefaults = {
    ...item,
  };

  return Schema.decode(ModelPersistedUserLogin)(itemWithDefaults);
};

const modelGetUserLoginsByFilter = (filter: string) => {
  return UserLoginsGraphListAccess.pipe(
    Effect.flatMap((listAccess) =>
      listAccess.getUserLoginGraphListItemsByFilter(filter)
    ),
    Effect.head,
    Effect.catchTag("NoSuchElementException", () =>
      Effect.fail(new UserLoginNotFound())
    ),
    Effect.map((item) => item.fields),
    Effect.flatMap((fields) => listItemToUserLogin(fields)),
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
  );
};

const modelGetUserLoginByIdentityProviderUserId = (id: string) => {
  return modelGetUserLoginsByFilter(`fields/IdentityProviderUserId eq '${id}'`);
};

const modelCreateUserLogin = (userLogin: ModelAddableUserLogin) => {
  return UserLoginsGraphListAccess.pipe(
    Effect.andThen((listAccess) =>
      Schema.encode(ModelAddableUserLogin)(userLogin).pipe(
        Effect.andThen(listAccess.createUserLoginGraphListItem)
      )
    ),
    Effect.andThen(listItemToUserLogin),
    Effect.catchTag("ParseError", (e) =>
      Effect.fail(new InvalidUserLoginValue())
    )
  );
};

export const userLoginRepositoryLive = Layer.effect(
  UserLoginRepository,
  UserLoginsGraphListAccess.pipe(
    Effect.map((service) => ({
      modelGetUserLoginByIdentityProviderUserId: (userId: string) =>
        modelGetUserLoginByIdentityProviderUserId(userId).pipe(
          Effect.provideService(UserLoginsGraphListAccess, service)
        ),

      modelCreateUserLogin: (userLogin: ModelAddableUserLogin) =>
        modelCreateUserLogin(userLogin).pipe(
          Effect.provideService(UserLoginsGraphListAccess, service)
        ),
    }))
  )
);
