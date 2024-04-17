import "isomorphic-fetch";
import { ClientSecretCredential } from "@azure/identity";
import {
  TokenCredentialAuthenticationProvider,
  TokenCredentialAuthenticationProviderOptions,
} from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { Client } from "@microsoft/microsoft-graph-client";
import { getWorkforcePortalConfig } from "./configuration-service";
import { logError, logTrace } from "../utilties/logging";

const config = getWorkforcePortalConfig();

export interface GraphUser {
  email: string;
  surname?: string | undefined;
  givenName?: string | undefined;
  displayName?: string | undefined;
  identityProvider: string;
}

const getGraphUserInfo = async (userId: string): Promise<any> => {
  const tokenCredential = new ClientSecretCredential(
    config.b2cTenantId,
    config.b2cClientId,
    config.b2cClientSecret
  );

  const options: TokenCredentialAuthenticationProviderOptions = {
    scopes: ["https://graph.microsoft.com/.default"],
  };

  const authProvider = new TokenCredentialAuthenticationProvider(
    tokenCredential,
    options
  );

  try {
    const client = Client.initWithMiddleware({
      debugLogging: true,
      authProvider: authProvider,
    });

    const res = await client
      .api("/users/" + userId)
      .select([
        "createdDateTime",
        "creationType",
        "displayName",
        "externalUserState",
        "givenName",
        "id",
        "identities",
        "mail",
        "mailNickname",
        "otherMails",
        "surname",
        "userPrincipalName",
        "userType",
      ])
      .get();

    return res;
  } catch (err) {
    logError("Error while looking up user in graph: " + JSON.stringify(err));
    return null;
  }
};

const emailFromGraphResponse = (graphResponse: any): string | undefined => {
  const identities: any[] = graphResponse.identities;
  const emailAddressIdentity = identities.find(
    (ident) => ident.signInType === "emailAddress"
  );
  if (emailAddressIdentity) {
    return emailAddressIdentity.issuerAssignedId;
  }

  const otherMails = graphResponse.otherMails;
  if (otherMails) {
    return otherMails[0];
  } else {
    return undefined;
  }
};

const identityProviderFromGraphResponse = (graphResponse: any): string => {
  const identities: any[] = graphResponse.identities;
  const federatedIdentity = identities.find(
    (ident) => ident.signInType === "federated"
  );
  if (federatedIdentity) {
    return federatedIdentity.issuer;
  } else {
    return "email";
  }
};

const displayNameFromGraphResponse = (graphResponse: any): string => {
  const graphDisplayName: string = graphResponse.displayName;
  if (graphDisplayName) {
    return graphDisplayName;
  } else {
    return emailFromGraphResponse(graphResponse) ?? "Unknown";
  }
};

const surnameFromGraphResponse = (graphResponse: any): string | undefined => {
  const surname: string = graphResponse.surname;
  if (surname) {
    return surname;
  } else {
    const displayName = displayNameFromGraphResponse(graphResponse);
    const displayNameWords = displayName.trim().split(/\s/);
    if (displayNameWords.length >= 2) {
      return displayNameWords[displayNameWords.length - 1];
    } else {
      return undefined;
    }
  }
};

const givenNameFromGraphResponse = (graphResponse: any): string | undefined => {
  const graphGivenName: string = graphResponse.givenName;
  if (graphGivenName) {
    return graphGivenName;
  } else {
    const displayName = displayNameFromGraphResponse(graphResponse);
    const displayNameWords = displayName.trim().split(/\s/);
    if (displayNameWords.length > 0) {
      if (displayNameWords.length >= 2) {
        displayNameWords.pop();
      }
      return displayNameWords.join(" ");
    } else {
      return undefined;
    }
  }
};

export const getGraphUser = async (
  userId: string
): Promise<GraphUser | undefined> => {
  logTrace("Retrieving graph user for userId: " + userId);
  const graphUserInfo = await getGraphUserInfo(userId);
  logTrace("Graph response: " + JSON.stringify(graphUserInfo));

  const email = emailFromGraphResponse(graphUserInfo);
  const identityProvider = identityProviderFromGraphResponse(graphUserInfo);

  if (email) {
    return {
      email,
      identityProvider,
      displayName: displayNameFromGraphResponse(graphUserInfo),
      givenName: givenNameFromGraphResponse(graphUserInfo),
      surname: surnameFromGraphResponse(graphUserInfo),
    };
  } else {
    return undefined;
  }
};
