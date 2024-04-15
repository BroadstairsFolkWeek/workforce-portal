import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { DefaultAzureCredential } from "@azure/identity";

import "isomorphic-fetch";

const credential = new DefaultAzureCredential();

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ["https://graph.microsoft.com/.default"],
});

const graphClient = Client.initWithMiddleware({
  authProvider: authProvider,
});

export const getTestGraphClient = () => graphClient;
