import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { Claim } from "../interfaces/claim";
import { AddableUserLogin, UserLogin } from "../interfaces/user-login";
import { getGraphUser } from "./users-graph";
import {
  createUserListItem,
  getUserLogin,
  updateUserListItem,
} from "./users-sp";

const USER_SERVICE_ERROR_TYPE_VAL =
  "user-service-error-d992f06a-75df-478c-a169-ec4024b48092";

type UserServiceErrorType = "unauthenticated" | "missing-claim";
export class UserServiceError {
  private type: typeof USER_SERVICE_ERROR_TYPE_VAL =
    USER_SERVICE_ERROR_TYPE_VAL;
  public error: UserServiceErrorType;
  public arg1: string | null;

  constructor(error: UserServiceErrorType, arg1?: string) {
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

const extractClaimOrThrow = (claims: Claim[], claimType: string): string => {
  const claim = extractClaim(claims, claimType);
  if (!claim) {
    throw new UserServiceError("missing-claim", claimType);
  }
  return claim;
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
    };

    return createUserListItem(newUserLogin);
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
    return userLogin;
  }

  const graphUser = await getGraphUser(userInfo.userId);
  console.log(JSON.stringify(graphUser, null, 2));

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
    };

    return createUserListItem(newUserLogin);
  } else {
    return null;
  }
};
