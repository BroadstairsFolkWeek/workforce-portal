import { ConfidentialClientApplication } from "@azure/msal-node";
import { getTestConfig } from "./test-config";

import "isomorphic-fetch";

const testConfig = getTestConfig();

test("Authenticate to and get from workforce-api", async () => {
  const msalConfidentialClientApp = new ConfidentialClientApplication({
    auth: {
      clientId: testConfig.WF_API_CLIENT_AUTH_CLIENT_ID,
      clientSecret: testConfig.WF_API_CLIENT_AUTH_CLIENT_SECRET,
      authority: testConfig.WF_API_CLIENT_AUTH_AUTHORITY,
    },
  });

  const authResult =
    await msalConfidentialClientApp.acquireTokenByClientCredential({
      scopes: [testConfig.WF_API_CLIENT_AUTH_SCOPES],
    });

  expect(authResult).toBeDefined();

  if (authResult) {
    expect(authResult.accessToken).toBeDefined();

    const apiResult = await fetch(testConfig.WF_API_URL, {
      headers: {
        Authorization: `Bearer ${authResult.accessToken}`,
      },
    });

    expect(apiResult.status).toBe(200);

    const jsonBody = await apiResult.json();

    expect(jsonBody).toBeDefined();
    console.log(jsonBody);
  }
}, 10000);
