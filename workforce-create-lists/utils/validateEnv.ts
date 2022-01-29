import { cleanEnv, str } from "envalid";

const validateEnv = () => {
  cleanEnv(process.env, {
    TENANT_ID: str(),
    CLIENT_ID: str(),
    CLIENT_SECRET: str(),
    TENANT_NAME: str(),
    SITE_PATH: str(),
  });
};

export default validateEnv;
