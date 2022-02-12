import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getTeams } from "../services/teams-service";
import { logTrace, setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace("teams: entry");

  const teams = await getTeams();
  context.res = {
    status: 200,
    body: teams,
  };
};

export default httpTrigger;
