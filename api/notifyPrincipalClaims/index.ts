import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { logInfo, logWarn, setLoggerFromContext } from "../utilties/logging";
import { Claim } from "../interfaces/claim";
import { isUserServiceError, updateUserClaims } from "../services/user-service";

/**
 * API allowing the client application to notify claims from its authentication (ID) token to the server.
 * This shouldn't be necessary since SWA is meant to provide the same client principal information at both the
 * server and client, but claims are currently missing server-side.
 *
 * Issue about missing claims has been reported here - https://github.com/MicrosoftDocs/azure-docs/issues/86803
 *
 * Until the issue is resolved, this api will allow clients to notify us of their claims, allowing us to receive
 * their email address and name.
 *
 * There is a risk with this approach in that a client could alter the claims they are sending, but the information
 * to be captured from the claims is not considered a major issue if tampered with. We will still have the user id
 * from the identity provider so can interogate Azure B2C if needed instead.
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logInfo("notifyPrincipalClaims: Body: " + req.body);

  // Only process the claims notification if the user is authenticated.
  const userInfo = getUserInfo(req);
  if (!userInfo) {
    logWarn(
      "notifyPrincipalClaims: Called by an unauthenticated user. No action taken."
    );
    context.res = {
      status: 401,
      body: { msg: "Not authenticated" },
    };
  } else {
    const claims = req.body as Claim[];

    try {
      await updateUserClaims(userInfo, claims);

      context.res = {
        status: 201,
      };
    } catch (err) {
      if (isUserServiceError(err)) {
        switch (err.error) {
          case "unauthenticated":
            context.res = {
              status: 401,
              body: "Cannot call notifyPrincipalClaims when not authenticated.",
            };
            break;

          case "missing-claim":
            context.res = {
              status: 401,
              body: "Missing claim in request body: " + err.arg1,
            };
            break;

          default:
            throw err;
        }
      } else {
        throw err;
      }
    }
  }
};

export default httpTrigger;
