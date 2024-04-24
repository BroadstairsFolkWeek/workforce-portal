import { User } from "@microsoft/microsoft-graph-types";
import { getB2cTestGraphClient } from "./graph-client";
import { getTestConfig } from "./test-config";

const testConfig = getTestConfig();

const graphClient = getB2cTestGraphClient();

test("Get user has user resource type", async () => {
  const result = (await graphClient
    .api(`/users/${testConfig.GRAPH_USER_ID}`)
    .select([
      "creationType",
      "displayName",
      "externalUserState",
      "givenName",
      "id",
      "identities",
      "surname",
      "userPrincipalName",
      "userType",
    ])
    .get()) as User;

  console.log(`Result from get-user: ${JSON.stringify(result)}`);
  expect(result.id).toBeDefined();
  expect(result.displayName).toBeDefined();
});

test("Get user throws an exception for unknown user", async () => {
  expect.assertions(1);

  try {
    const result = (await graphClient.api(`/users/000`).get()) as User;
  } catch (e) {
    console.log(`Error from get-user: ${JSON.stringify(e)}`);
    expect(e).toBeDefined();
  }
});
