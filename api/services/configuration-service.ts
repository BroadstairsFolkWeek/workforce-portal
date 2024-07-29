export interface WorkforcePortalConfig {
  authSignUpSignInAuthority: string;
}

function getEnvOrThrow(envName: string): string {
  if (process.env[envName] !== undefined) {
    return process.env[envName]!;
  } else {
    throw new Error("Environment variable not defined: " + envName);
  }
}

const config: WorkforcePortalConfig = {
  authSignUpSignInAuthority: getEnvOrThrow("SIGN_UP_SIGN_IN_AUTHORITY"),
};

export function getWorkforcePortalConfig(): Readonly<WorkforcePortalConfig> {
  return { ...config };
}
