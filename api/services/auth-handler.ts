import { URL } from "url";
import { HttpRequest, HttpRequestQuery } from "@azure/functions";
import { getWorkforcePortalConfig } from "./configuration-service";

const config = getWorkforcePortalConfig();

/**
 * HTTP response object. Provided to your function when using HTTP Bindings.
 */
export type HttpResponseContextObject = {
  [key: string]: any;
};

export const logoutHandler = (req: HttpRequest): HttpResponseContextObject => {
  return {
    status: 302,
    headers: {
      Location: getLogoutUrl(req),
    },
  };
};

export const logoutStage2Handler = (
  req: HttpRequest
): HttpResponseContextObject => {
  return {
    status: 302,
    headers: {
      Location: getSwaLogoutUrl(req),
    },
  };
};

export const authErrorHandler = (
  req: HttpRequest
): HttpResponseContextObject => {
  return {
    status: 302,
    headers: {
      Location: getAuthErrorUrl(req),
    },
  };
};

const getCurrentFunctionsUrl = (req: HttpRequest): URL => {
  const currentFunctionsUrl = new URL(req.headers["x-ms-original-url"] ?? "");

  // If URL is http, replace with https unless it is addressing the localhost.
  if (
    currentFunctionsUrl.protocol === "http:" &&
    currentFunctionsUrl.hostname !== "localhost"
  ) {
    currentFunctionsUrl.protocol = "https:";
  }

  return currentFunctionsUrl;
};

const getCurrentFunctionsHref = (req: HttpRequest): string => {
  const currentFunctionsUrl = getCurrentFunctionsUrl(req);
  return currentFunctionsUrl.href;
};

const getPostLogoutUrl = (req: HttpRequest): string => {
  const currentFunctionsUrl = getCurrentFunctionsHref(req);
  return new URL("/", currentFunctionsUrl).href;
};

const getLogoutSecondStageUrl = (req: HttpRequest): URL => {
  const currentFunctionsUrl = getCurrentFunctionsHref(req);
  return new URL("/api/logoutStage2", currentFunctionsUrl);
};

// Generate the URL needed to log the user out from the configured identity provider, noted via the configured
// Sign-Up-Sign-In authority. If authority is set to 'local' then rely only on the standard SWA logout URL.
const getLogoutUrl = (req: HttpRequest): URL => {
  const authority = config.authSignUpSignInAuthority;

  if (authority === "local") {
    return getSwaLogoutUrl(req);
  } else {
    const logoutUrl = new URL(authority + "/oauth2/v2.0/logout");
    logoutUrl.searchParams.append(
      "redirect_uri",
      getLogoutSecondStageUrl(req).href
    );
    return logoutUrl;
  }
};

const getSwaLogoutUrl = (req: HttpRequest): URL => {
  const currentFunctionsUrl = getCurrentFunctionsUrl(req);
  const logoutUrl = new URL("/.auth/logout", currentFunctionsUrl);
  logoutUrl.searchParams.append("redirect_uri", getPostLogoutUrl(req));
  return logoutUrl;
};

const getAuthErrorUrl = (req: HttpRequest): URL => {
  const currentFunctionsUrl = getCurrentFunctionsUrl(req);
  const authErrorUrl = new URL("/autherror", currentFunctionsUrl);

  const errorQuery: HttpRequestQuery = req.query;

  for (const queryKey in errorQuery) {
    const queryVal = errorQuery[queryKey];
    authErrorUrl.searchParams.append(queryKey, queryVal ?? "");
  }
  return authErrorUrl;
};
