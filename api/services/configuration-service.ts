export interface WorkforcePortalConfig {
  spSiteUrl: string;
  spClientId: string;
  spClientSecret: string;
  spLoginsListGuid: string;
  spApplicationsListGuid: string;
  authSignUpSignInAuthority: string;
  b2cTenantId: string;
  b2cClientId: string;
  b2cClientSecret: string;
}

function getEnvOrThrow(envName: string): string {
  if (process.env[envName] !== undefined) {
    return process.env[envName]!;
  } else {
    throw new Error("Environment variable not defined: " + envName);
  }
}

const config: WorkforcePortalConfig = {
  spSiteUrl: getEnvOrThrow("WORKFORCE_SITE"),
  spClientId: getEnvOrThrow("WORKFORCE_CLIENT_ID"),
  spClientSecret: getEnvOrThrow("WORKFORCE_CLIENT_SECRET"),
  spLoginsListGuid: getEnvOrThrow("WORKFORCE_LOGINS_LIST_GUID"),
  spApplicationsListGuid: getEnvOrThrow("WORKFORCE_APPLICATIONS_LIST_GUID"),
  authSignUpSignInAuthority: getEnvOrThrow("SIGN_UP_SIGN_IN_AUTHORITY"),
  b2cTenantId: getEnvOrThrow("B2C_TENANT_ID"),
  b2cClientId: getEnvOrThrow("B2C_CLIENT_ID"),
  b2cClientSecret: getEnvOrThrow("B2C_CLIENT_SECRET"),
};

export function getWorkforcePortalConfig(): Readonly<WorkforcePortalConfig> {
  return { ...config };
}
