import {
  AddableUserLogin,
  UpdatableUserLogin,
  UserLogin,
} from "../interfaces/user-login";
import { logError, logTrace } from "../utilties/logging";
import {
  createUserLoginListItem,
  deleteUserLogin,
  getUserLoginsByProfileId,
  updateUserLoginListItem,
} from "./users-sp";
import { Effect, Either, Layer } from "effect";
import { UserLoginRepository } from "../model/user-login-repository";
import { userLoginRepositoryLive } from "../model/user-logins-repository-graph";
import { applicationsRepositoryLive } from "../model/applications-repository-graph";
import { defaultGraphClient } from "../graph/default-graph-client";
import { GraphUsersRepository } from "../model/graph-users-repository";
import { ModelGraphUser } from "../model/interfaces/graph-user";
import { graphUsersRepositoryLive } from "../model/graph-users-repository-graph";
import { b2cGraphClient } from "../graph/b2c-graph-client";
import { graphListAccessesLive } from "../model/graph/default-graph-list-access";

const USER_SERVICE_ERROR_TYPE_VAL =
  "user-service-error-d992f06a-75df-478c-a169-ec4024b48092";

type UserServiceErrorType =
  | "unauthenticated"
  | "missing-graph-data"
  | "missing-user-login";

export class UserServiceError {
  private type: typeof USER_SERVICE_ERROR_TYPE_VAL =
    USER_SERVICE_ERROR_TYPE_VAL;
  public error: UserServiceErrorType;
  public arg1: any | null;

  constructor(error: UserServiceErrorType, arg1?: any) {
    this.error = error;
    this.arg1 = arg1 ?? null;
  }
}

export class UserUnauthenticatedError {
  _tag = "UserUnauthenticatedError";
}

export class UnknownUser {
  _tag = "UnknownUser";
}

export function isUserServiceError(obj: any): obj is UserServiceError {
  return obj?.type === USER_SERVICE_ERROR_TYPE_VAL;
}

const emailFromGraphUser = (graphUser: ModelGraphUser): string => {
  const identities = graphUser.identities;
  const emailAddressIdentity = identities.find(
    (ident) => ident.signInType === "emailAddress"
  );
  if (emailAddressIdentity) {
    return emailAddressIdentity.issuerAssignedId;
  }

  return graphUser.userPrincipalName;
};

const displayNameFromGraphUser = (graphResponse: ModelGraphUser): string => {
  return graphResponse.displayName;
};

const surnameFromGraphUser = (graphUser: ModelGraphUser): string => {
  const displayName = displayNameFromGraphUser(graphUser);
  const displayNameWords = displayName.trim().split(/\s/);
  if (displayNameWords.length >= 2) {
    return displayNameWords[displayNameWords.length - 1];
  } else {
    return "";
  }
};

const givenNameFromGraphUser = (graphUser: ModelGraphUser): string => {
  const displayName = displayNameFromGraphUser(graphUser);
  const displayNameWords = displayName.trim().split(/\s/);
  if (displayNameWords.length > 0) {
    if (displayNameWords.length >= 2) {
      displayNameWords.pop();
    }
    return displayNameWords.join(" ");
  } else {
    return "";
  }
};

const getUserLoginPropertiesFromGraph = (userId: string) => {
  return GraphUsersRepository.pipe(
    Effect.andThen((repo) => repo.modelGetGraphUserById(userId)),
    Effect.andThen((graphUser) => ({
      displayName: displayNameFromGraphUser(graphUser),
      identityProviderUserId: userId,
      identityProviderUserDetails: "unused",
      givenName: givenNameFromGraphUser(graphUser),
      surname: surnameFromGraphUser(graphUser),
      email: emailFromGraphUser(graphUser),
    }))
  );
};

export const getUserLogin = (userId: string) =>
  UserLoginRepository.pipe(
    Effect.andThen((repo) =>
      repo.modelGetUserLoginByIdentityProviderUserId(userId)
    ),

    Effect.catchTag("UserLoginNotFound", () => Effect.fail(new UnknownUser()))
  );

export const createUserLogin = async (
  userId: string,
  profileId: string
): Promise<UserLogin> => {
  const layers = graphUsersRepositoryLive.pipe(Layer.provide(b2cGraphClient));

  const graphUserEffect = getUserLoginPropertiesFromGraph(userId).pipe(
    Effect.andThen((graphUser) => ({
      ...graphUser,
      profileId,
    })),
    Effect.either
  );

  const runnableGraphUser = Effect.provide(graphUserEffect, layers).pipe(
    Effect.orDie
  );

  const graphUserEither = await Effect.runPromise(runnableGraphUser);

  if (Either.isLeft(graphUserEither)) {
    logError(
      "createUserLogin: Could not read information for user from Graph API. User login not created."
    );
    throw new UserServiceError("missing-graph-data");
  } else {
    const graphUser = graphUserEither.right;

    const newUserLogin: AddableUserLogin = {
      profileId,
      displayName: graphUser.displayName,
      identityProviderUserId: userId,
      identityProviderUserDetails: "unused",
      givenName: graphUser.givenName,
      surname: graphUser.surname,
      email: graphUser.email,
      identityProvider: "unknown",
    };

    logTrace(
      "createUserLogin: About to create user login: " +
        JSON.stringify(newUserLogin)
    );
    return createUserLoginListItem(newUserLogin);
  }
};

export const updateUserLogin = async (
  updatableUserLogin: UpdatableUserLogin,
  userId: string
): Promise<UserLogin> => {
  const repositoriesLayer = Layer.merge(
    userLoginRepositoryLive,
    applicationsRepositoryLive
  );

  const layers = repositoriesLayer.pipe(
    Layer.provide(graphListAccessesLive),
    Layer.provide(defaultGraphClient)
  );

  // Retrieve the existing user login
  const existingUserLoginEffect = getUserLogin(userId).pipe(Effect.either);
  const runnableGetUserLogin = Effect.provide(existingUserLoginEffect, layers);

  const existingUserLoginEither = await Effect.runPromise(runnableGetUserLogin);

  if (Either.isRight(existingUserLoginEither)) {
    const existingUserLogin = existingUserLoginEither.right;

    const updatedUserLogin: UserLogin = {
      ...existingUserLogin,
      ...updatableUserLogin,
    };

    return updateUserLoginListItem(updatedUserLogin);
  } else {
    throw new UserServiceError("missing-user-login");
  }
};

export const deleteUserLoginsByProfileId = async (profileId: string) => {
  logTrace(
    `deleteUserLoginsByProfileId: Retrieving logins for profile ID: ${profileId}`
  );
  const userLogins = await getUserLoginsByProfileId(profileId);
  logTrace(
    `deleteUserLoginsByProfileId: Retrieved ${userLogins.length} logins`
  );

  const userLoginDeletePromises = userLogins.map((login) =>
    deleteUserLogin(login)
  );

  await Promise.all(userLoginDeletePromises);
};
