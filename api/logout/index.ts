import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { logoutHandler } from "../services/auth-handler";
import { setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);

  context.res = logoutHandler(req);
};

export default httpTrigger;
