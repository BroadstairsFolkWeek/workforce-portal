import {
  getUserInfo,
  isAuthenticated,
} from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  if (!isAuthenticated(req)) {
    context.res = {
      status: 200,
      body: { msg: "Not authenticated" },
    };
  } else {
    const userInfo = getUserInfo(req);
    context.res = {
      status: 200,
      body: { msg: "authenticated", userInfo },
    };
  }
};

export default httpTrigger;
