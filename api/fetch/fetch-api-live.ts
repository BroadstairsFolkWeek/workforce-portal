import { Layer } from "effect";
import * as Http from "@effect/platform/HttpClient";
import { FetchApi } from "./fetch-api";

export const fetchApiLive = Layer.succeed(
  FetchApi,
  FetchApi.of({
    fetchGet: (url: string) =>
      Http.request.get(url).pipe(Http.client.fetch, Http.response.arrayBuffer),
  })
);
