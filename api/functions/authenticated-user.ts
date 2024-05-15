import { Schema } from "@effect/schema";
import { HttpRequest } from "@azure/functions";
import { Effect, Encoding } from "effect";
import { AuthenticatedUser } from "../interfaces/authenticated-user";

export class UserNotAuthenticated {
  readonly _tag = "UserNotAuthenticated";
}

const getAuthenticationHeader = (req: HttpRequest) =>
  Effect.fromNullable(req.headers["x-ms-client-principal"]).pipe(
    Effect.catchTag("NoSuchElementException", () =>
      Effect.fail(new UserNotAuthenticated())
    )
  );

const getDecodedAuthenticationHeader = (req: HttpRequest) =>
  getAuthenticationHeader(req).pipe(
    Effect.andThen(Encoding.decodeBase64String),
    Effect.catchTag("DecodeException", (e) =>
      Effect.logWarning(
        "Could not decode x-ms-client-principal request header as a base64 string: " +
          e.input
      ).pipe(Effect.andThen(Effect.fail(new UserNotAuthenticated())))
    )
  );

const AuthenticatedUserFromJsonSchema = Schema.parseJson(AuthenticatedUser);

const getParsedAuthenticatedUser = (req: HttpRequest) =>
  getDecodedAuthenticationHeader(req).pipe(
    Effect.andThen((authenticationHeaderJson) =>
      Schema.decode(AuthenticatedUserFromJsonSchema)(authenticationHeaderJson)
    ),
    Effect.catchTag("ParseError", (e) =>
      Effect.logWarning(
        "Could not parse x-ms-client-principal request header into an AuthenticatedUser object: " +
          e.message
      ).pipe(Effect.andThen(Effect.fail(new UserNotAuthenticated())))
    )
  );

export const getAuthenticatedUserId = (req: HttpRequest) =>
  getParsedAuthenticatedUser(req).pipe(
    Effect.andThen((authUser) => authUser.userId)
  );
