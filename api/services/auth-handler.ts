import { URL } from "url";
import { HttpRequest } from "@azure/functions";
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
      Location: getLogoutUrl(req, config.authSignUpSignInAuthority),
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

const getLogoutUrl = (req: HttpRequest, authority: string): URL => {
  const currentFunctionsUrl = getCurrentFunctionsUrl(req);

  let logoutUrl: URL;

  if (currentFunctionsUrl.hostname === "localhost") {
    logoutUrl = new URL("/.auth/logout", currentFunctionsUrl);
  } else {
    logoutUrl = new URL(authority + "/oauth2/v2.0/logout");
  }

  logoutUrl.searchParams.append("redirect_uri", getPostLogoutUrl(req));
  return logoutUrl;
};
