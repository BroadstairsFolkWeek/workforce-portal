import { Context, Effect } from "effect";
import * as Http from "@effect/platform/HttpClient";

export class FetchApi extends Context.Tag("FetchApi")<
  FetchApi,
  {
    readonly fetchGet: (
      url: string
    ) => Effect.Effect<ArrayBuffer, Http.error.HttpClientError>;
  }
>() {}
