export interface WorkforcePortalConfig {
  spSiteUrl: string;
  spClientId: string;
  spClientSecret: string;
  spLoginsListGuid: string;
  spProfilesListGuid: string;
  spApplicationsListGuid: string;
  spTeamsListGuid: string;
  spWorkforcePhotosServerRelativeUrl: string;
  spWorkforcePhotosLibraryTitle: string;
  maxProfilePhotosPerPerson: number;
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

function getEnvNumberOrThrow(envName: string): number {
  const valueAsString = getEnvOrThrow(envName);

  return Number.parseInt(valueAsString);
}

const config: WorkforcePortalConfig = {
  spSiteUrl: getEnvOrThrow("WORKFORCE_SITE"),
  spClientId: getEnvOrThrow("WORKFORCE_CLIENT_ID"),
  spClientSecret: getEnvOrThrow("WORKFORCE_CLIENT_SECRET"),
  spLoginsListGuid: getEnvOrThrow("WORKFORCE_LOGINS_LIST_GUID"),
  spProfilesListGuid: getEnvOrThrow("WORKFORCE_PROFILES_LIST_GUID"),
  spApplicationsListGuid: getEnvOrThrow("WORKFORCE_APPLICATIONS_LIST_GUID"),
  spTeamsListGuid: getEnvOrThrow("WORKFORCE_TEAMS_LIST_GUID"),
  spWorkforcePhotosServerRelativeUrl: getEnvOrThrow(
    "WORKFORCE_PHOTOS_SERVER_RELATIVE_URL"
  ),
  spWorkforcePhotosLibraryTitle: getEnvOrThrow(
    "WORKFORCE_PHOTOS_LIBRARY_TITLE"
  ),
  maxProfilePhotosPerPerson: getEnvNumberOrThrow(
    "MAX_PROFILE_PHOTOS_PER_PERSON"
  ),
  authSignUpSignInAuthority: getEnvOrThrow("SIGN_UP_SIGN_IN_AUTHORITY"),
  b2cTenantId: getEnvOrThrow("B2C_TENANT_ID"),
  b2cClientId: getEnvOrThrow("B2C_CLIENT_ID"),
  b2cClientSecret: getEnvOrThrow("B2C_CLIENT_SECRET"),
};

export function getWorkforcePortalConfig(): Readonly<WorkforcePortalConfig> {
  return { ...config };
}
