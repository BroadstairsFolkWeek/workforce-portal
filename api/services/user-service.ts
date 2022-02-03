import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { Claim } from "../interfaces/claim";
import { AddableUserLogin, UserLogin } from "../interfaces/user-login";
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

const extractOrThrowEmail = (claims: Claim[]): string => {
  const emails = extractClaimOrThrow(claims, "emails");
  return emails.split(",")[0];
};

export const updateUserClaims = async (
  userInfo: UserInfo,
  claims: Claim[]
): Promise<UserLogin> => {
  if (!userInfo || !userInfo.userId || !userInfo.userDetails) {
    throw new UserServiceError("unauthenticated");
  }

  const userLogin = await getUserLogin(userInfo.userId);
  if (userLogin) {
    const updatedUserLogin: UserLogin = {
      ...userLogin,
      userDetails: userInfo.userDetails,
      givenName: extractClaimOrThrow(
        claims,
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
      ),
      surname: extractClaimOrThrow(
        claims,
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
      ),
      identityProvider: extractClaimOrThrow(
        claims,
        "http://schemas.microsoft.com/identity/claims/identityprovider"
      ),
      email: extractOrThrowEmail(claims),
    };

    return updateUserListItem(updatedUserLogin);
  } else {
    const newUserLogin: AddableUserLogin = {
      userDetails: userInfo.userDetails,
      userId: userInfo.userId,
      givenName: extractClaimOrThrow(
        claims,
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
      ),
      surname: extractClaimOrThrow(
        claims,
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
      ),
      identityProvider: extractClaimOrThrow(
        claims,
        "http://schemas.microsoft.com/identity/claims/identityprovider"
      ),
      email: extractOrThrowEmail(claims),
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

  return getUserLogin(userInfo.userId);
};
