import * as dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

const output = dotenv.config({
  path: "./tests-exploratory/.env",
});

if (output.error) {
  console.error(output.error);
}

export const getTestConfig = () => {
  if (output.error) {
    throw output.error;
  }

  return cleanEnv(output.parsed, {
    AZURE_B2C_TENANT_ID: str(),
    AZURE_B2C_CLIENT_ID: str(),
    AZURE_B2C_CLIENT_SECRET: str(),
    GRAPH_USER_ID: str(),
    WF_API_CLIENT_AUTH_AUTHORITY: str(),
    WF_API_CLIENT_AUTH_CLIENT_ID: str(),
    WF_API_CLIENT_AUTH_CLIENT_SECRET: str(),
    WF_API_CLIENT_AUTH_SCOPE: str(),
    WF_API_URL: str(),
  });
};
