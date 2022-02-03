import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { logoutHandler } from "../services/auth-handler";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.res = logoutHandler(req);
};

export default httpTrigger;
