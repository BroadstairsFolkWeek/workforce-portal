import { URL } from "url";
import { Config, Effect, Layer, Secret } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { ConfidentialClientApplication } from "@azure/msal-node";

import { WfApiClient } from "./wf-client";

import "isomorphic-fetch";

const getConfidentialClientApp = (
  clientId: string,
  clientSecret: string,
  authority: string
) =>
  new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret: clientSecret,
      authority,
    },
  });

type AuthenticationSupplier = ReturnType<typeof getAuthenticationSupplier>;

const getAuthenticationSupplier =
  (
    clientId: string,
    clientSecret: string,
    authority: string,
    scopes: string[]
  ) =>
  () =>
    Effect.succeed(getConfidentialClientApp(clientId, clientSecret, authority))
      .pipe(
        Effect.andThen((msalConfidentialClientApp) =>
          Effect.promise(() =>
            msalConfidentialClientApp.acquireTokenByClientCredential({
              scopes,
            })
          )
        )
      )
      .pipe(
        Effect.andThen(Effect.fromNullable),
        Effect.catchTag("NoSuchElementException", () =>
          Effect.die("Failed to get access token for WF API")
        )
      );

const generateUrl = (baseUrl: URL) => (path: string, search?: string) => {
  const url = new URL(path, baseUrl);
  if (search) {
    url.search = search;
  }
  return url;
};

const apiGetJson =
  (authenticationSupplier: AuthenticationSupplier) =>
  (baseUrl: URL) =>
  (path: string, search?: string) =>
    authenticationSupplier().pipe(
      Effect.andThen((authenticationResult) =>
        HttpClientRequest.get(generateUrl(baseUrl)(path, search), {
          headers: {
            Authorization: `Bearer ${authenticationResult.accessToken}`,
          },
        }).pipe(HttpClient.fetchOk, HttpClientResponse.json)
      )
    );

const apiPostJsonData =
  (authenticationSupplier: AuthenticationSupplier) =>
  (baseUrl: URL) =>
  (path: string, search?: string) =>
  (data: unknown) =>
    authenticationSupplier().pipe(
      Effect.andThen((authenticationResult) =>
        HttpClientRequest.post(generateUrl(baseUrl)(path, search), {
          headers: {
            Authorization: `Bearer ${authenticationResult.accessToken}`,
          },
        }).pipe(
          HttpClientRequest.jsonBody(data),
          Effect.andThen(HttpClient.fetchOk),
          HttpClientResponse.json
        )
      )
    );

const apiPutFormData =
  (authenticationSupplier: AuthenticationSupplier) =>
  (baseUrl: URL) =>
  (path: string, search?: string) =>
  (formData: FormData) =>
    authenticationSupplier().pipe(
      Effect.andThen((authenticationResult) =>
        HttpClientRequest.put(generateUrl(baseUrl)(path, search), {
          headers: {
            Authorization: `Bearer ${authenticationResult.accessToken}`,
          },
        }).pipe(
          HttpClientRequest.formDataBody(formData),
          HttpClient.fetchOk,
          HttpClientResponse.json
        )
      )
    );

const apiPutJsonData =
  (authenticationSupplier: AuthenticationSupplier) =>
  (baseUrl: URL) =>
  (path: string, search?: string) =>
  (data: unknown) =>
    authenticationSupplier().pipe(
      Effect.andThen((authenticationResult) =>
        HttpClientRequest.put(generateUrl(baseUrl)(path, search), {
          headers: {
            Authorization: `Bearer ${authenticationResult.accessToken}`,
          },
        }).pipe(
          HttpClientRequest.jsonBody(data),
          Effect.andThen(HttpClient.fetchOk),
          HttpClientResponse.json
        )
      )
    );

const apiPatchJsonData =
  (authenticationSupplier: AuthenticationSupplier) =>
  (baseUrl: URL) =>
  (path: string, search?: string) =>
  (data: unknown) =>
    authenticationSupplier().pipe(
      Effect.andThen((authenticationResult) =>
        HttpClientRequest.patch(generateUrl(baseUrl)(path, search), {
          headers: {
            Authorization: `Bearer ${authenticationResult.accessToken}`,
          },
        }).pipe(
          HttpClientRequest.jsonBody(data),
          Effect.andThen(HttpClient.fetchOk),
          HttpClientResponse.json
        )
      )
    );

const apiDeleteJsonResponse =
  (authenticationSupplier: AuthenticationSupplier) =>
  (baseUrl: URL) =>
  (path: string, search?: string) =>
    authenticationSupplier().pipe(
      Effect.andThen((authenticationResult) =>
        HttpClientRequest.del(generateUrl(baseUrl)(path, search), {
          headers: {
            Authorization: `Bearer ${authenticationResult.accessToken}`,
          },
        }).pipe(HttpClient.fetchOk, HttpClientResponse.json)
      )
    );

const apiDeleteNoResponse =
  (authenticationSupplier: AuthenticationSupplier) =>
  (baseUrl: URL) =>
  (path: string, search?: string) =>
    authenticationSupplier().pipe(
      Effect.andThen((authenticationResult) =>
        HttpClientRequest.del(generateUrl(baseUrl)(path, search), {
          headers: {
            Authorization: `Bearer ${authenticationResult.accessToken}`,
          },
        }).pipe(HttpClient.fetchOk, HttpClientResponse.void)
      )
    );

export const wfApiClientLive = Layer.effect(
  WfApiClient,
  Effect.all([
    Config.string("WF_API_CLIENT_AUTH_CLIENT_ID"),
    Config.secret("WF_API_CLIENT_AUTH_CLIENT_SECRET"),
    Config.string("WF_API_CLIENT_AUTH_AUTHORITY"),
    Config.string("WF_API_CLIENT_AUTH_SCOPE"),
    Config.string("WF_API_URL"),
  ]).pipe(
    Effect.andThen(([clientId, clientSecret, authority, scope, baseUrl]) =>
      WfApiClient.of({
        getJson: apiGetJson(
          getAuthenticationSupplier(
            clientId,
            Secret.value(clientSecret),
            authority,
            [scope]
          )
        )(new URL(baseUrl)),

        postJsonDataJsonResponse: apiPostJsonData(
          getAuthenticationSupplier(
            clientId,
            Secret.value(clientSecret),
            authority,
            [scope]
          )
        )(new URL(baseUrl)),

        putFormDataJsonResponse: apiPutFormData(
          getAuthenticationSupplier(
            clientId,
            Secret.value(clientSecret),
            authority,
            [scope]
          )
        )(new URL(baseUrl)),

        patchJsonDataJsonResponse: apiPatchJsonData(
          getAuthenticationSupplier(
            clientId,
            Secret.value(clientSecret),
            authority,
            [scope]
          )
        )(new URL(baseUrl)),

        putJsonDataJsonResponse: apiPutJsonData(
          getAuthenticationSupplier(
            clientId,
            Secret.value(clientSecret),
            authority,
            [scope]
          )
        )(new URL(baseUrl)),

        deleteJsonResponse: apiDeleteJsonResponse(
          getAuthenticationSupplier(
            clientId,
            Secret.value(clientSecret),
            authority,
            [scope]
          )
        )(new URL(baseUrl)),

        deleteNoResponse: apiDeleteNoResponse(
          getAuthenticationSupplier(
            clientId,
            Secret.value(clientSecret),
            authority,
            [scope]
          )
        )(new URL(baseUrl)),
      })
    )
  )
);
