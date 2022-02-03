import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { logoutStage2Handler } from "../services/auth-handler";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.res = logoutStage2Handler(req);
};

export default httpTrigger;
