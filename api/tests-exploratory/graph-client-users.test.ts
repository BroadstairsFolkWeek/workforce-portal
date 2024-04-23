import { User } from "@microsoft/microsoft-graph-types";
import { getB2cTestGraphClient } from "./graph-client";
import { getTestConfig } from "./test-config";

const testConfig = getTestConfig();

const graphClient = getB2cTestGraphClient();

test("Get user has user resource type", async () => {
  const result = (await graphClient
    .api(`/users/${testConfig.GRAPH_USER_ID}`)
    .get()) as User;

  expect(result.id).toBeDefined();
  expect(result.displayName).toBeDefined();
  console.log(`Result from get-user: ${JSON.stringify(result)}`);
});
