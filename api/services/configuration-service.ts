export interface WorkforcePortalConfig {
  spSiteUrl: string;
  spClientId: string;
  spClientSecret: string;
  spLoginsListGuid: string;
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
};

export function getWorkforcePortalConfig(): Readonly<WorkforcePortalConfig> {
  return { ...config };
}
