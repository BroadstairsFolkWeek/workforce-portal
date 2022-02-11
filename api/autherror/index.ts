import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authErrorHandler } from "../services/auth-handler";
import { logTrace, setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace("autherror: entry.");

  logTrace("Query: " + JSON.stringify(req.query, null, 2));
  context.res = authErrorHandler(req);
};

export default httpTrigger;
