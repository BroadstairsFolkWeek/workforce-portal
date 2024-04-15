import { env } from "process";
import { GraphError } from "@microsoft/microsoft-graph-client";
import { Site } from "@microsoft/microsoft-graph-types";
import { getTestGraphClient } from "./graph-client";

const graphClient = getTestGraphClient();

const siteHostname = env.GRAPH_SITE_HOSTNAME;
const sitePath = env.GRAPH_SITE_PATH;

export const getTestSite = async (
  apiPath: string = `/sites/${siteHostname}:${sitePath}`
) => {
  console.log(`Getting Site from API path: ${apiPath}`);
  return graphClient.api(apiPath).get() as Site;
};

export const getTestSiteId = async () => {
  const site = await getTestSite();
  return site.id;
};

test("Get site response has Site type", async () => {
  const result = await getTestSite();

  expect(result.id).toBeDefined();
  expect(result.name).toBeDefined();
  expect(result.displayName).toBeDefined();
  expect(result.webUrl).toBeDefined();
  console.log(`Result from get-site: ${JSON.stringify(result)}`);
});

test("Get site promise rejects for an invalid site path", async () => {
  expect.assertions(3);

  try {
    await getTestSite(`/sites/${siteHostname}:/unknownpath`);
  } catch (error) {
    console.log(
      `Error from get-site for invalid site path: ${JSON.stringify(error)}`
    );
    expect(error).toBeInstanceOf(GraphError);
    if (error instanceof GraphError) {
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("itemNotFound");
    }
  }
});

test("Get site promise rejects for invalid site hostname for tenancy being connected to", async () => {
  expect.assertions(3);

  try {
    await getTestSite(`/sites/example.com:${sitePath}`);
  } catch (error) {
    console.log(
      `Error from get-site for invalid site hostname: ${JSON.stringify(error)}`
    );
    expect(error).toBeInstanceOf(GraphError);
    if (error instanceof GraphError) {
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("invalidRequest");
    }
  }
});
