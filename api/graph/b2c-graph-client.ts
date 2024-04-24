import { Config, Effect, Layer, Secret } from "effect";
import { GraphClient } from "./graph-client";
import { ClientSecretCredential } from "@azure/identity";
import { getGraphClient } from "./graph-client-common";

const getClientSecretCredential = () =>
  Effect.all([
    Config.string("AZURE_B2C_TENANT_ID"),
    Config.string("AZURE_B2C_CLIENT_ID"),
    Config.secret("AZURE_B2C_CLIENT_SECRET"),
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

export const b2cGraphClient = Layer.effect(
  GraphClient,
  getClientSecretCredential().pipe(
    Effect.andThen(getGraphClient),
    Effect.andThen((gc) =>
      GraphClient.of({
        client: Effect.succeed(gc),
      })
    )
  )
);
