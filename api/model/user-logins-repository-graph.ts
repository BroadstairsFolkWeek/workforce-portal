import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import { GraphListAccess } from "./graph/graph-list-access";
import { ModelPersistedUserLogin } from "./interfaces/user-login";
import { UserLoginRepository } from "./user-login-repository";

export class UserLoginNotFound {
  readonly _tag = "UserLoginNotFound";
}

const listItemToUserLogin = (item: any) => {
  // Apply defaults for any missing fields.
  const itemWithDefaults = {
    ...item,
  };

  return Schema.decode(ModelPersistedUserLogin)(itemWithDefaults);
};

const modelGetUserLoginsByFilter = (filter: string) => {
  return GraphListAccess.pipe(
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

export const userLoginRepositoryLive = Layer.effect(
  UserLoginRepository,
  GraphListAccess.pipe(
    Effect.map((service) => ({
      modelGetUserLoginByIdentityProviderUserId: (userId: string) =>
        modelGetUserLoginByIdentityProviderUserId(userId).pipe(
          Effect.provideService(GraphListAccess, service)
        ),
    }))
  )
);
