import { AzureFunction, Context } from "@azure/functions";
import { getTeamsSortedByDisplayOrder } from "../services/teams-service";
import { createLoggerLayer } from "../utilties/logging";
import { Effect, LogLevel, Logger } from "effect";
import { repositoriesLayerLive } from "../contexts/repositories-live";

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<void> {
  const getTeams = Effect.logTrace("teams: entry****").pipe(
    Effect.andThen(getTeamsSortedByDisplayOrder),
    Effect.andThen((teams) => ({ status: 200 as const, body: teams }))
  );

  const logLayer = createLoggerLayer(context);

  context.res = await Effect.runPromise(
    getTeams.pipe(
      Effect.provide(repositoriesLayerLive),
      Logger.withMinimumLogLevel(LogLevel.Debug),
      Effect.provide(logLayer)
    )
  );
};

export default httpTrigger;
