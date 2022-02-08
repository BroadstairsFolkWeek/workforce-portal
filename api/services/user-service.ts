import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { Claim } from "../interfaces/claim";
import {
  AddableUserLogin,
  UpdatableUserLogin,
  UserLogin,
} from "../interfaces/user-login";
import { getGraphUser } from "./users-graph";
import {
  createUserListItem,
  getUserLogin,
  updateUserListItem,
} from "./users-sp";

const USER_SERVICE_ERROR_TYPE_VAL =
  "user-service-error-d992f06a-75df-478c-a169-ec4024b48092";

type UserServiceErrorType =
  | "unauthenticated"
  | "missing-claim"
  | "version-conflict"
  | "missing-user-profile";

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

const extractClaim = (
  claims: Claim[],
  claimType: string
): string | undefined => {
  return claims.find((c) => c.typ === claimType)?.val ?? undefined;
};

const extractEmail = (claims: Claim[]): string | undefined => {
  const emails = extractClaim(claims, "emails");
  return emails ? emails.split(",")[0] : undefined;
};

export const updateUserClaims = async (
  userInfo: UserInfo,
  claims: Claim[]
): Promise<UserLogin> => {
  if (!userInfo || !userInfo.userId || !userInfo.userDetails) {
    throw new UserServiceError("unauthenticated");
  }

  const claimedIdentityProvider =
    extractClaim(
      claims,
      "http://schemas.microsoft.com/identity/claims/identityprovider"
    ) ?? "email";
  const claimedGivenName = extractClaim(
    claims,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
  );
  const claimedSurname = extractClaim(
    claims,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
  );

  const claimedEmail = extractEmail(claims);

  const userLogin = await getUserLogin(userInfo.userId);
  if (userLogin) {
    const updatedUserLogin: UserLogin = {
      ...userLogin,
    };

    if (claimedIdentityProvider !== userLogin.identityProvider) {
      updatedUserLogin.identityProvider = claimedIdentityProvider;
    }

    if (claimedGivenName !== userLogin.givenName) {
      updatedUserLogin.givenName = claimedGivenName;
    }

    if (claimedSurname !== userLogin.surname) {
      updatedUserLogin.surname = claimedSurname;
    }

    if (claimedEmail !== userLogin.email) {
      updatedUserLogin.email = claimedEmail;
    }

    return updateUserListItem(updatedUserLogin);
  } else {
    const newUserLogin: AddableUserLogin = {
      displayName: userInfo.userDetails,
      identityProviderUserId: userInfo.userId,
      identityProviderUserDetails: userInfo.userDetails,
      givenName: claimedGivenName,
      surname: claimedSurname,
      identityProvider: claimedIdentityProvider,
      email: claimedEmail,
      photoRequired: true,
      version: 1,
    };

    return createUserListItem(newUserLogin);
  }
};

const getUserProfilePropertiesFromGraph = async (
  userInfo: UserInfo
): Promise<AddableUserLogin | null> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  const graphUser = await getGraphUser(userInfo.userId);
  console.log(JSON.stringify(graphUser, null, 2));

  if (graphUser && graphUser.identityProvider) {
    const userLoginFromGraph: AddableUserLogin = {
      displayName: graphUser.displayName ?? "unknown",
      identityProviderUserId: userInfo.userId,
      identityProviderUserDetails: userInfo.userDetails ?? "unknown",
      givenName: graphUser.givenName,
      surname: graphUser.surname,
      email: graphUser.email,
      identityProvider: graphUser.identityProvider,
      photoRequired: true,
      version: 1,
    };
    return userLoginFromGraph;
  } else {
    return null;
  }
};

export const getUserProfile = async (
  userInfo: UserInfo
): Promise<UserLogin | null> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  const userLogin = await getUserLogin(userInfo.userId);
  if (userLogin) {
    // Check and populate any missing mandatory properties on the user profile.
    if (!userLogin.identityProvider || !userLogin.identityProviderUserDetails) {
      const graphUser = await getUserProfilePropertiesFromGraph(userInfo);
      if (graphUser && graphUser.identityProvider) {
        const updatingUserLogin: UserLogin = {
          ...userLogin,
        };

        if (!userLogin.identityProvider) {
          updatingUserLogin.identityProvider = graphUser.identityProvider;
        }

        if (!userLogin.identityProviderUserDetails) {
          updatingUserLogin.identityProviderUserDetails =
            graphUser.identityProviderUserDetails;
        }

        return updateUserListItem(updatingUserLogin);
      }
    }

    return userLogin;
  } else {
    const graphUser = await getUserProfilePropertiesFromGraph(userInfo);
    if (graphUser && graphUser.identityProvider) {
      const newUserLogin: AddableUserLogin = {
        displayName: graphUser.displayName ?? "unknown",
        identityProviderUserId: userInfo.userId,
        identityProviderUserDetails: userInfo.userDetails ?? "unknown",
        givenName: graphUser.givenName,
        surname: graphUser.surname,
        email: graphUser.email,
        identityProvider: graphUser.identityProvider,
        photoRequired: true,
        version: 1,
      };

      return createUserListItem(newUserLogin);
    } else {
      return null;
    }
  }
};

export const updateUserProfile = async (
  updatableProfile: UpdatableUserLogin,
  userInfo: UserInfo
): Promise<UserLogin> => {
  // Retrieve the existing user profile
  const existingProfile = await getUserProfile(userInfo);

  if (existingProfile) {
    // Update the user's profile it as long as the version numbers match.
    if (existingProfile.version === updatableProfile.version) {
      const updatedProfile: UserLogin = {
        ...existingProfile,
        ...updatableProfile,
        version: existingProfile.version + 1,
      };

      return updateUserListItem(updatedProfile);
    } else {
      // The profile being saved has a different version number to the existing application. The user may
      // have saved the profile from another device.
      throw new UserServiceError("version-conflict", existingProfile);
    }
  } else {
    throw new UserServiceError("missing-user-profile");
  }
};
