import { Config, Effect, Layer } from "effect";
import { getSiteId } from "./site-graph";
import { GraphListAccess } from "./graph-list-access";
import { GraphClient } from "../../graph/graph-client";
import { graphRequestGetOrDie, graphRequestPatchOrDie } from "./graph";
import { Client } from "@microsoft/microsoft-graph-client";
import { ModelApplicationChangesVersioned } from "../interfaces/application";

// Consider any error whilst retrieving the siteId as an unexpected (and unrecoverable) error.
const siteId = getSiteId().pipe(Effect.orDie);
// Any config error is unrecoverable.
const applicationsListId = Config.string(
  "WORKFORCE_APPLICATIONS_LIST_GUID"
).pipe(Effect.orDie);

const userLoginsListId = Config.string("WORKFORCE_LOGINS_LIST_GUID").pipe(
  Effect.orDie
);

const getListItemsByFilter =
  (client: Client) => (siteId: string, listId: string) => (filter?: string) => {
    const apiPath = `/sites/${siteId}/lists/${listId}/items`;
    const graphRequest = client.api(apiPath).expand("fields");

    return Effect.succeed(graphRequest).pipe(
      Effect.map((gr) => (filter ? gr.filter(filter) : gr)),
      Effect.flatMap(graphRequestGetOrDie),
      // No graph errors for get requests against a list are expected to be recoverable.
      Effect.catchTag("GraphClientGraphError", (e) => Effect.die(e.graphError)),
      Effect.map((graphResponse) => graphResponse.value as Array<any>)
    );
  };

const updateApplicationGraphListItemFields =
  (client: Client, siteId: string, listId: string) =>
  (id: number, versionedChanges: ModelApplicationChangesVersioned) => {
    const apiPath = `/sites/${siteId}/lists/${listId}/items/${id}/fields`;
    const graphRequest = client.api(apiPath);

    return graphRequestPatchOrDie(graphRequest)(versionedChanges).pipe(
      // No graph errors for get requests against a list are expected to be recoverable.
      Effect.catchTag("GraphClientGraphError", (e) => Effect.die(e.graphError))
    );
  };

const clientEffect = GraphClient.pipe(Effect.flatMap((gc) => gc.client));

export const defaultListAccess = Layer.effect(
  GraphListAccess,
  Effect.all([clientEffect, siteId, applicationsListId, userLoginsListId]).pipe(
    Effect.map(([client, siteId, applicationsListId, userLoginsListId]) =>
      GraphListAccess.of({
        getApplicationGraphListItemsByFilter: getListItemsByFilter(client)(
          siteId,
          applicationsListId
        ),
        getUserLoginGraphListItemsByFilter: getListItemsByFilter(client)(
          siteId,
          userLoginsListId
        ),
        updateApplicationGraphListItemFields:
          updateApplicationGraphListItemFields(
            client,
            siteId,
            applicationsListId
          ),
      })
    )
  )
);
