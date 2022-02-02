import {
  AddableApplication,
  ApplicationDtoRunType,
} from "../interfaces/application";
import { UserLogin } from "../interfaces/user-login";

// This function allows us to ensure only desired properties are copied from the object provided by the API client.
export const sanitiseApplicationFromApiClient = (
  maybeApplication: any,
  userLogin: UserLogin
): AddableApplication => {
  const applicationDto = ApplicationDtoRunType.check(maybeApplication);

  const sanitisedApplication: AddableApplication = {
    telephone: applicationDto.telephone,
    address: applicationDto.address,
    emergencyContactName: applicationDto.emergencyContactName,
    emergencyContactTelephone: applicationDto.emergencyContactTelephone,
    previousVolunteer: applicationDto.previousVolunteer,
    previousTeam: applicationDto.previousTeam,
    firstAidCertificate: applicationDto.firstAidCertificate,
    occupationOrSkills: applicationDto.occupationOrSkills,
    dbsDisclosureNumber: applicationDto.dbsDisclosureNumber,
    dbsDisclosureDate: applicationDto.dbsDisclosureDate,
    camping: applicationDto.camping,
    tShirtSize: applicationDto.tShirtSize,
    ageGroup: applicationDto.ageGroup,
    otherInformation: applicationDto.otherInformation,
    teamPreference1: applicationDto.teamPreference1,
    teamPreference2: applicationDto.teamPreference2,
    teamPreference3: applicationDto.teamPreference3,
    personsPreference: applicationDto.personsPreference,
    version: applicationDto.version,

    identityProviderUserId: userLogin.userId,
    userDetails: userLogin.userDetails,
  };

  return sanitisedApplication;
};
