import { config as dotenvconfig } from "dotenv";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";

import validateEnv from "../utils/validateEnv";

dotenvconfig();
validateEnv();

const credential = new ClientSecretCredential(
  process.env["TENANT_ID"],
  process.env["CLIENT_ID"],
  process.env["CLIENT_SECRET"]
);
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ["https://graph.microsoft.com/.default"],
});

const client = Client.initWithMiddleware({
  debugLogging: true,
  authProvider,
});

export function getClient() {
  return client;
}

export async function getSiteBaseApi(): Promise<string> {
  const siteRequest = await client
    .api(
      `/sites/${process.env["TENANT_NAME"]}.sharepoint.com:${process.env["SITE_PATH"]}`
    )
    .get();
  const siteBaseApi: string = "sites/" + siteRequest.id;
  return siteBaseApi;
}
