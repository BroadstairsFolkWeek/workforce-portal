import { HttpClientError } from "@effect/platform";
import { HttpBodyError } from "@effect/platform/HttpBody";
import { Effect, Context } from "effect";

export class WfApiClient extends Context.Tag("WfApiClient")<
  WfApiClient,
  {
    readonly getJson: (
      path: string,
      search?: string
    ) => Effect.Effect<unknown, HttpClientError.HttpClientError>;

    readonly putFormDataJsonResponse: (
      path: string,
      search?: string
    ) => (
      formData: FormData
    ) => Effect.Effect<unknown, HttpClientError.HttpClientError>;

    readonly putJsonDataJsonResponse: (
      path: string,
      search?: string
    ) => (
      jsonData: unknown
    ) => Effect.Effect<
      unknown,
      HttpClientError.HttpClientError | HttpBodyError
    >;
  }
>() {}
