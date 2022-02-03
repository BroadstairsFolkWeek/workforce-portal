import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { logoutStage2Handler } from "../services/auth-handler";
import { setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);

  context.res = logoutStage2Handler(req);
};

export default httpTrigger;
