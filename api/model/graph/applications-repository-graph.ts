import { Config, Effect } from "effect";
import { PersistedGraphListItem } from "../interfaces/graph/graph-items";
import { getGraphClient, graphRequestGetOrDie } from "./graph";
import { getSiteId } from "./site-graph";
// import { PersistedApplicationGraphListItemFields } from "../interfaces/graph/application-graph-items";

const applicationsListId = Config.string("WORKFORCE_APPLICATIONS_LIST_GUID");

const applicationsListItemsPath = Effect.all([
  getSiteId(),
  applicationsListId,
]).pipe(
  Effect.map(([siteId, listId]) => `/sites/${siteId}/lists/${listId}/items`)
);

export const getApplicationGraphListItemsByFilter = (filter?: string) => {
  return applicationsListItemsPath
    .pipe(
      Effect.flatMap((path) =>
        getGraphClient().pipe(Effect.map((client) => client.api(path)))
      )
    )
    .pipe(
      Effect.map((gr) => gr.expand("fields")),
      Effect.map((gr) => (filter ? gr.filter(filter) : gr)),
      Effect.flatMap(graphRequestGetOrDie),
      Effect.map(
        (graphResponse) =>
          graphResponse.value as Array<// PersistedGraphListItem<PersistedApplicationGraphListItemFields>
          any>
      )
    );
};
