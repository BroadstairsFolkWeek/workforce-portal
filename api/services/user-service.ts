import { Effect } from "effect";
import { GraphUsersRepository } from "../model/graph-users-repository";
import { ModelGraphUser } from "../model/interfaces/graph-user";

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
  public arg1: unknown | null;

  constructor(error: UserServiceErrorType, arg1?: unknown) {
    this.error = error;
    this.arg1 = arg1 ?? null;
  }
}

export class UserUnauthenticatedError {
  readonly _tag = "UserUnauthenticatedError";
}

export class UnknownUser {
  readonly _tag = "UnknownUser";
}

export function isUserServiceError(obj: unknown): obj is UserServiceError {
  return (
    !!obj &&
    typeof obj === "object" &&
    "type" in obj &&
    obj.type === USER_SERVICE_ERROR_TYPE_VAL
  );
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

export const getUserLoginPropertiesFromGraph = (userId: string) => {
  return GraphUsersRepository.pipe(
    Effect.andThen((repo) => repo.modelGetGraphUserById(userId)),
    Effect.andThen((graphUser) => ({
      id: userId,
      displayName: displayNameFromGraphUser(graphUser),
      givenName: givenNameFromGraphUser(graphUser),
      surname: surnameFromGraphUser(graphUser),
      email: emailFromGraphUser(graphUser),
    }))
  );
};
