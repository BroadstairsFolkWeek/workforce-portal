import {
  AddableUserLogin,
  UpdatableUserLogin,
  UserLogin,
} from "../interfaces/user-login";
import { logError, logTrace } from "../utilties/logging";
import { getGraphUser } from "./users-graph";
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
import { defaultListAccess } from "../model/graph/default-graph-list-access";
import { defaultGraphClient } from "../graph/default-graph-client";

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

type RawUserLogin = Omit<AddableUserLogin, "profileId">;

const getUserLoginPropertiesFromGraph = async (
  userId: string
): Promise<RawUserLogin | null> => {
  const graphUser = await getGraphUser(userId);
  console.log(
    "getUserLoginPropertiesFromGraph: GraphUser: " +
      JSON.stringify(graphUser, null, 2)
  );

  if (graphUser && graphUser.identityProvider) {
    const userLoginFromGraph: RawUserLogin = {
      displayName: graphUser.displayName ?? "unknown",
      identityProviderUserId: userId,
      identityProviderUserDetails: "unused",
      givenName: graphUser.givenName,
      surname: graphUser.surname,
      email: graphUser.email,
      identityProvider: graphUser.identityProvider,
    };
    return userLoginFromGraph;
  } else {
    return null;
  }
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
  const graphUser = await getUserLoginPropertiesFromGraph(userId);
  if (graphUser && graphUser.identityProvider) {
    const newUserLogin: AddableUserLogin = {
      profileId,
      displayName: graphUser.displayName ?? "unknown",
      identityProviderUserId: userId,
      identityProviderUserDetails: "unused",
      givenName: graphUser.givenName,
      surname: graphUser.surname,
      email: graphUser.email,
      identityProvider: graphUser.identityProvider,
    };

    logTrace(
      "createUserLogin: About to create user login: " +
        JSON.stringify(newUserLogin)
    );
    return createUserLoginListItem(newUserLogin);
  } else {
    logError(
      "createUserLogin: Could not read information for user from Graph API. User login not created."
    );
    throw new UserServiceError("missing-graph-data");
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
    Layer.provide(defaultListAccess),
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
