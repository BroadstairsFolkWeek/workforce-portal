import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import { TeamsGraphListAccess } from "./graph/teams-graph-list-access";
import { ModelPersistedTeam } from "./interfaces/team";
import { TeamsRepository } from "./teams-repository";
import {
  PersistedGraphListItem,
  PersistedGraphListItemFields,
} from "./interfaces/graph/graph-items";

const graphListItemToTeam = (
  item: PersistedGraphListItem<PersistedGraphListItemFields>
) => {
  return Schema.decodeUnknown(ModelPersistedTeam)(item.fields);
};

const modelGetTeamsByFilter = (filter?: string) => {
  return TeamsGraphListAccess.pipe(
    Effect.flatMap((listAccess) =>
      listAccess.getTeamGraphListItemsByFilter(filter)
    ),
    Effect.andThen(Effect.forEach(graphListItemToTeam)),
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
  );
};

const modelGetTeams = () => {
  return modelGetTeamsByFilter();
};

export const teamsRepositoryLive = Layer.effect(
  TeamsRepository,
  TeamsGraphListAccess.pipe(
    Effect.map((service) => ({
      modelGetTeams: () =>
        modelGetTeams().pipe(
          Effect.provideService(TeamsGraphListAccess, service)
        ),
    }))
  )
);
