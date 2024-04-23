import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { logoutHandler } from "../services/auth-handler";
import { deleteUser } from "../services/delete-user-service";
import { logTrace, setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace(`deleteUser: entry`);

  const userInfo = getUserInfo(req);
  if (userInfo) {
    logTrace(
      `deleteUser: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
    );

    try {
      await deleteUser(userInfo.userId!);
      context.res = logoutHandler(req);
    } catch (err) {}
  } else {
    logTrace(`deleteUser: User is not authenticated.`);
    context.res = {
      status: 401,
      body: "Cannot delete user when user not authenticated.",
    };
  }
};

export default httpTrigger;
