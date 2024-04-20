import { Effect } from "effect";
import { GraphRequest } from "@microsoft/microsoft-graph-client";
import {
  GraphClientGraphError,
  wrapIfGraphError,
} from "../interfaces/graph/graph-error";
import { GraphClient } from "../../graph/graph-client";

export const getGraphClient = () =>
  GraphClient.pipe(Effect.flatMap((gc) => gc.client));

export const graphRequestGetOrDie = (gr: GraphRequest) =>
  Effect.tryPromise({
    try: () => gr.get(),
    catch: (e) => wrapIfGraphError(e),
  }).pipe(
    Effect.catchAll((e) =>
      e instanceof GraphClientGraphError ? Effect.fail(e) : Effect.die(e)
    )
  );

export const graphRequestPatchOrDie = (gr: GraphRequest) => (body: any) =>
  Effect.tryPromise({
    try: () => gr.patch(body),
    catch: (e) => wrapIfGraphError(e),
  }).pipe(
    Effect.catchAll((e) =>
      e instanceof GraphClientGraphError ? Effect.fail(e) : Effect.die(e)
    )
  );
