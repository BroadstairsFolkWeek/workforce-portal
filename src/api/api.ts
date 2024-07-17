import { Data, Effect } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { ResponseError } from "@effect/platform/HttpClientError";

export class NotAuthenticated extends Data.TaggedClass("NotAuthenticated") {}

export class VersionConflict extends Data.TaggedClass("VersionConflict") {}

export class ServerError extends Data.TaggedClass("ServerError")<{
  responseError: ResponseError;
}> {}

export const apiGetJson = (path: string) =>
  HttpClientRequest.get(path).pipe(HttpClient.fetchOk, HttpClientResponse.json);

export const apiPostJsonData = (path: string) => (data: unknown) =>
  HttpClientRequest.post(path).pipe(
    HttpClientRequest.jsonBody(data),
    Effect.andThen(HttpClient.fetchOk),
    HttpClientResponse.json
  );
