import { Effect } from "effect";
import { graphRequestGetOrDie, graphRequestPatchOrDie } from "./graph";
import { ModelApplicationChangesVersioned } from "../interfaces/application";
import { GraphClient } from "../../graph/graph-client";
import { getSiteId } from "./site-graph";

// Consider any error whilst retrieving the siteId as an unexpected (and unrecoverable) error.
const siteIdEffect = getSiteId().pipe(Effect.orDie);

export const getListItemsByFilter = (listId: string) => (filter?: string) => {
  return siteIdEffect.pipe(
    Effect.andThen((siteId) =>
      GraphClient.pipe(
        Effect.andThen((gc) => gc.client),
        Effect.andThen((client) =>
          client.api(`/sites/${siteId}/lists/${listId}/items`).expand("fields")
        ),
        Effect.andThen((gr) => (filter ? gr.filter(filter) : gr)),
        Effect.andThen(graphRequestGetOrDie),
        // No graph errors for get requests against a list are expected to be recoverable.
        Effect.catchTag("GraphClientGraphError", (e) =>
          Effect.die(e.graphError)
        ),
        Effect.andThen((graphResponse) => graphResponse.value as Array<any>)
      )
    )
  );
};

export const updateApplicationGraphListItemFields =
  (listId: string) =>
  (id: number, versionedChanges: ModelApplicationChangesVersioned) => {
    return siteIdEffect.pipe(
      Effect.andThen((siteId) =>
        GraphClient.pipe(
          Effect.andThen((gc) => gc.client),
          Effect.andThen((client) =>
            client.api(`/sites/${siteId}/lists/${listId}/items/${id}/fields`)
          ),
          Effect.andThen((gr) => graphRequestPatchOrDie(gr)(versionedChanges)),
          // No graph errors for get requests against a list are expected to be recoverable.
          Effect.catchTag("GraphClientGraphError", (e) =>
            Effect.die(e.graphError)
          )
        )
      )
    );
  };
