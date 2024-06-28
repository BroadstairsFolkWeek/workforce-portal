import { Context, Effect } from "effect";
import { HttpClientError } from "@effect/platform";

export class FetchApi extends Context.Tag("FetchApi")<
  FetchApi,
  {
    readonly fetchGet: (
      url: string
    ) => Effect.Effect<ArrayBuffer, HttpClientError.HttpClientError>;
  }
>() {}
