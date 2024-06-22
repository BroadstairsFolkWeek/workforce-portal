import { Config, Effect, Layer, Secret } from "effect";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { WfApiClient } from "./wf-client";
import { URL } from "url";

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
    authenticationSupplier()
      .pipe(
        Effect.andThen((authenticationResult) =>
          Effect.promise(() =>
            fetch(generateUrl(baseUrl)(path, search), {
              headers: {
                Authorization: `Bearer ${authenticationResult.accessToken}`,
              },
            })
          )
        )
      )
      .pipe(
        Effect.andThen((response) => Effect.promise(() => response.json()))
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
      })
    )
  )
);
