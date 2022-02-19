import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import {
  AddableUserLogin,
  UpdatableUserLogin,
  UserLogin,
} from "../interfaces/user-login";
import { logError, logTrace } from "../utilties/logging";
import { getGraphUser } from "./users-graph";
import {
  createUserLoginListItem,
  getUserLoginByIdentityProviderUserId,
  updateUserLoginListItem,
} from "./users-sp";

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

export function isUserServiceError(obj: any): obj is UserServiceError {
  return obj?.type === USER_SERVICE_ERROR_TYPE_VAL;
}

type RawUserLogin = Omit<AddableUserLogin, "profileId">;

const getUserLoginPropertiesFromGraph = async (
  userInfo: UserInfo
): Promise<RawUserLogin | null> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  const graphUser = await getGraphUser(userInfo.userId);
  console.log(
    "getUserLoginPropertiesFromGraph: GraphUser: " +
      JSON.stringify(graphUser, null, 2)
  );

  if (graphUser && graphUser.identityProvider) {
    const userLoginFromGraph: RawUserLogin = {
      displayName: graphUser.displayName ?? "unknown",
      identityProviderUserId: userInfo.userId,
      identityProviderUserDetails: userInfo.userDetails ?? "unknown",
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

export const getUserLogin = async (
  userInfo: UserInfo
): Promise<UserLogin | null> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  return getUserLoginByIdentityProviderUserId(userInfo.userId);
};

export const createUserLogin = async (
  userInfo: UserInfo,
  profileId: string
): Promise<UserLogin> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  const graphUser = await getUserLoginPropertiesFromGraph(userInfo);
  if (graphUser && graphUser.identityProvider) {
    const newUserLogin: AddableUserLogin = {
      profileId,
      displayName: graphUser.displayName ?? "unknown",
      identityProviderUserId: userInfo.userId,
      identityProviderUserDetails: userInfo.userDetails ?? "unknown",
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
  userInfo: UserInfo
): Promise<UserLogin> => {
  // Retrieve the existing user login
  const existingUserLogin = await getUserLogin(userInfo);

  if (existingUserLogin) {
    const updatedUserLogin: UserLogin = {
      ...existingUserLogin,
      ...updatableUserLogin,
    };

    return updateUserLoginListItem(updatedUserLogin);
  } else {
    throw new UserServiceError("missing-user-login");
  }
};
