import {
  UpdatableUserLogin,
  UserProfileUpdateDtoRunType,
} from "../interfaces/user-login";

// This function allows us to ensure only desired properties are copied from the object provided by the API client.
export const sanitiseUserProfileUpdateFromApiClient = (
  maybeUserProfileUpdate: any
): UpdatableUserLogin => {
  const userProfileDto = UserProfileUpdateDtoRunType.check(
    maybeUserProfileUpdate
  );

  const sanitisedUserLogin: UpdatableUserLogin = {
    displayName: userProfileDto.displayName,
    givenName: userProfileDto.givenName,
    surname: userProfileDto.surname,
    telephone: userProfileDto.telephone,
    address: userProfileDto.address,
    version: userProfileDto.version,
  };

  return sanitisedUserLogin;
};
