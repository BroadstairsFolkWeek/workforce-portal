import { Config, Effect, Layer, Secret } from "effect";
import { GraphClient } from "./graph-client";
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";

const getClientSecretCredential = () =>
  Effect.all([
    Config.string("AZURE_TENANT_ID"),
    Config.string("AZURE_CLIENT_ID"),
    Config.secret("AZURE_CLIENT_SECRET"),
  ]).pipe(
    Effect.map(
      ([tenantId, clientId, clientSecret]) =>
        new ClientSecretCredential(
          tenantId,
          clientId,
          Secret.value(clientSecret)
        )
    )
  );

const getAuthProvider = () =>
  getClientSecretCredential().pipe(
    Effect.map(
      (credential) =>
        new TokenCredentialAuthenticationProvider(credential, {
          scopes: ["https://graph.microsoft.com/.default"],
        })
    )
  );

const getGraphClient = () =>
  getAuthProvider().pipe(
    Effect.map((authProvider) =>
      Client.initWithMiddleware({
        authProvider: authProvider,
      })
    )
  );

export const defaultGraphClient = Layer.effect(
  GraphClient,
  Effect.map(getGraphClient(), (gc) =>
    GraphClient.of({
      client: Effect.succeed(gc),
    })
  )
);
