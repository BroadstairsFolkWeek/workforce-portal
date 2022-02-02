import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getApplication } from "../services/application-service";
import { setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);

  const userInfo = getUserInfo(req);
  if (userInfo) {
    const application = await getApplication(userInfo);
    if (application) {
      context.res = {
        status: 200,
        body: application,
      };
    } else {
      context.res = {
        status: 404,
        body: "Application not found",
      };
    }
  } else {
    context.res = {
      status: 401,
      body: "Cannot get application when not authenticated.",
    };
  }
};

export default httpTrigger;
