import {
  getUserInfo,
  isAuthenticated,
} from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserProfile, isUserServiceError } from "../services/user-service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const userInfo = getUserInfo(req);
  if (userInfo) {
    try {
      const userProfile = await getUserProfile(userInfo);
      if (userProfile) {
        context.res = {
          body: userProfile,
        };
      } else {
        context.res = {
          status: 404,
          body: "Profile does not exist",
        };
      }
    } catch (err) {
      if (isUserServiceError(err)) {
        switch (err.error) {
          case "unauthenticated":
            context.res = {
              status: 401,
              body: "Cannot retrieve profile when not authenticated.",
            };
            break;
        }
      }
    }
  } else {
    context.res = {
      status: 401,
      body: "Cannot retrieve profile when not authenticated.",
    };
  }
};

export default httpTrigger;
