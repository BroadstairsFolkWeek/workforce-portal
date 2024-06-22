import { ConfidentialClientApplication } from "@azure/msal-node";
import { getTestConfig } from "./test-config";

import "isomorphic-fetch";

// These tests are carried out using a dev deployment of the wf-api azure container app.
// Dev deployments may scale to zero and therefore have a cold start time to be accounted
// for in test timeouts.
const wfApiTimeout = 30000;

const testConfig = getTestConfig();

const msalConfidentialClientApp = new ConfidentialClientApplication({
  auth: {
    clientId: testConfig.WF_API_CLIENT_AUTH_CLIENT_ID,
    clientSecret: testConfig.WF_API_CLIENT_AUTH_CLIENT_SECRET,
    authority: testConfig.WF_API_CLIENT_AUTH_AUTHORITY,
  },
});

const getAccessToken = async () => {
  const authResult =
    await msalConfidentialClientApp.acquireTokenByClientCredential({
      scopes: [testConfig.WF_API_CLIENT_AUTH_SCOPES],
    });

  if (authResult) {
    return authResult.accessToken;
  } else {
    throw new Error("Failed to get access token");
  }
};

test(
  "Authenticate to and get from workforce-api",
  async () => {
    const accessToken = await getAccessToken();

    const apiResult = await fetch(testConfig.WF_API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(apiResult.status).toBe(200);

    const jsonBody = await apiResult.json();

    expect(jsonBody).toBeDefined();
    console.log(jsonBody);
  },
  wfApiTimeout
);

test(
  "Repeated token aquisition reuses token from cache",
  async () => {
    const accessToken1 = await getAccessToken();
    const accessToken2 = await getAccessToken();

    expect(accessToken1).toBe(accessToken2);
  },
  wfApiTimeout
);
