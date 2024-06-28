import { Layer } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { FetchApi } from "./fetch-api";

export const fetchApiLive = Layer.succeed(
  FetchApi,
  FetchApi.of({
    fetchGet: (url: string) =>
      HttpClientRequest.get(url).pipe(
        HttpClient.fetch,
        HttpClientResponse.arrayBuffer
      ),
  })
);
